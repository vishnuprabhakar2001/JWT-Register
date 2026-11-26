import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import { OrganisationAdmin } from "../models/OrganisationAdmin.js";
import { OrganisationSubAdmin } from "../models/OrganisationSubAdmin.js";
import { OrganisationRefreshToken } from "../models/OrganisationRefreshToken.js";
import { createAccessToken, createSubadminAccessToken } from "../utils/security.js";
import { ensureSuperadminOrganisationActive } from "../utils/superadminStatus.js";

export const ROLE_ADMIN = "organisation_admin";
export const ROLE_SUBADMIN = "organisation_subadmin";
export const REFRESH_TOKEN_TYPE = "refresh";

const SESSION_EXPIRED_MESSAGE =
  `Your session has expired because you were inactive for ${config.ORG_REFRESH_TOKEN_EXPIRE_DAYS} days. Please enter your Email ID and Password to login and start a new session.`;

const INVALID_REFRESH_TOKEN_MESSAGE =
  "Invalid refresh token. Please enter your Email ID and Password to login.";

export const issueRefreshToken = async (userId, role, familyId = null) => {
  const secret = config.JWT_REFRESH_SECRET_KEY;
  const now = Math.floor(Date.now() / 1000);
  const lifetimeSeconds = config.ORG_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60;
  const expiresAt = now + lifetimeSeconds;

  const jti = crypto.randomUUID().replace(/-/g, "");
  const family = familyId || crypto.randomUUID().replace(/-/g, "");

  const payload = {
    sub: String(userId),
    actor_role: role,
    type: REFRESH_TOKEN_TYPE,
    jti,
    fid: family,
    iat: now,
    exp: expiresAt,
  };

  const token = jwt.sign(payload, secret);

  const expiresDate = new Date(expiresAt * 1000);
  const deleteAt = new Date(expiresDate.getTime() + 24 * 60 * 60 * 1000);

  await OrganisationRefreshToken.create({
    jti,
    family_id: family,
    user_id: String(userId),
    actor_role: role,
    is_revoked: false,
    expires_at: expiresDate,
    delete_at: deleteAt,
  });

  return {
    refresh_token: token,
    expires_in: lifetimeSeconds,
    family_id: family,
  };
};

export const refreshOrganisationSession = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, INVALID_REFRESH_TOKEN_MESSAGE);
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET_KEY);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, SESSION_EXPIRED_MESSAGE);
    }
    throw new ApiError(401, INVALID_REFRESH_TOKEN_MESSAGE);
  }

  if (payload.type !== REFRESH_TOKEN_TYPE) {
    throw new ApiError(401, INVALID_REFRESH_TOKEN_MESSAGE);
  }

  const { sub: userId, actor_role: role, jti, fid: familyId } = payload;
  const stored = await OrganisationRefreshToken.findOne({ jti });

  if (!stored) {
    throw new ApiError(401, INVALID_REFRESH_TOKEN_MESSAGE);
  }

  if (stored.is_revoked) {
    // Revoke whole token family for reuse detection
    await OrganisationRefreshToken.updateMany(
      { family_id: familyId },
      { $set: { is_revoked: true } }
    );
    throw new ApiError(401, INVALID_REFRESH_TOKEN_MESSAGE);
  }

  // Invalidate old token (one-time use)
  stored.is_revoked = true;
  await stored.save();

  // Validate actor
  let newAccessToken;
  if (role === ROLE_SUBADMIN) {
    const subadmin = await OrganisationSubAdmin.findById(userId);
    if (!subadmin || !subadmin.is_active) {
      throw new ApiError(403, "Your SubAdmin account is blocked.");
    }
    const admin = await OrganisationAdmin.findById(subadmin.organisation_admin_id);
    if (!admin || !admin.is_active) {
      throw new ApiError(403, "Organisation Admin account is inactive.");
    }
    await ensureSuperadminOrganisationActive(admin);
    newAccessToken = createSubadminAccessToken(subadmin._id);
  } else {
    const admin = await OrganisationAdmin.findById(userId);
    if (!admin || !admin.is_active) {
      throw new ApiError(403, "Organisation Admin account is inactive.");
    }
    await ensureSuperadminOrganisationActive(admin);
    newAccessToken = createAccessToken(admin._id);
  }

  // Issue rotated refresh token
  const newRefresh = await issueRefreshToken(userId, role, familyId);

  return {
    access_token: newAccessToken,
    refresh_token: newRefresh.refresh_token,
    token_type: "bearer",
    expires_in: config.JWT_EXPIRY_MINUTES * 60,
    refresh_token_expires_in: newRefresh.expires_in,
  };
};
