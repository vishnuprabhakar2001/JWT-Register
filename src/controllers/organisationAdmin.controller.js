import asyncHandler from "../middlewares/asyncHandler.js";
import mongoose from "mongoose";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import { verifyPassword, createAccessToken, createSubadminAccessToken } from "../utils/security.js";
import { OrganisationAdmin } from "../models/OrganisationAdmin.model.js";
import { OrganisationSubAdmin } from "../models/OrganisationSubAdmin.model.js";
import { getSuperadminOrganisationModel } from "../models/SuperadminOrganisation.model.js";
import {
  issueRefreshToken,
  ROLE_ADMIN,
  ROLE_SUBADMIN,
} from "./organisationRefreshToken.controller.js";

const SUPERADMIN_ACTIVE_STATUS = "active";
const NOT_REGISTERED_MESSAGE =
  "Your details are not present. Please contact the Super Admin.";

export const serializeAdmin = (admin) => {
  const adminId = String(admin._id);
  return {
    id: adminId,
    organisation_admin_id: String(admin.organisation_admin_id || adminId),
    organisation_id: String(admin.organisation_id || adminId),
    name: admin.name,
    email: admin.email,
    organisation_name: admin.organisation_name,
    is_active: admin.is_active !== undefined ? admin.is_active : true,
    created_at: admin.created_at ? admin.created_at.toISOString() : new Date().toISOString(),
  };
};

export const loginOrganisationAdmin = async ({ email, password }) => {
  const normalizedEmail = String(email).trim().toLowerCase();

  // 1. Check SuperAdmin db
  const SuperadminOrgModel = getSuperadminOrganisationModel();
  let superadminOrg = null;
  if (SuperadminOrgModel) {
    superadminOrg = await SuperadminOrgModel.findOne({
      $or: [{ email_normalized: normalizedEmail }, { email: normalizedEmail }],
    });
  }

  // If no Super Admin org found
  if (!superadminOrg) {
    // Check if admin already exists directly in local db
    const existing = await OrganisationAdmin.findOne({ email: normalizedEmail });
    if (!existing) {
      throw new ApiError(404, NOT_REGISTERED_MESSAGE);
    }
    const isValid = await verifyPassword(password, existing.hashed_password);
    if (!isValid) {
      throw new ApiError(401, "Invalid email or password.");
    }
    if (!existing.is_active) {
      throw new ApiError(403, "Organisation Admin account is inactive.");
    }
    const accessToken = createAccessToken(existing._id);
    const refresh = await issueRefreshToken(String(existing._id), ROLE_ADMIN);
    return {
      message: "Login successful.",
      access_token: accessToken,
      refresh_token: refresh.refresh_token,
      token_type: "bearer",
      expires_in: config.JWT_EXPIRY_MINUTES * 60,
      refresh_token_expires_in: refresh.expires_in,
      admin: serializeAdmin(existing),
    };
  }

  // 2. Verify password from SuperAdmin
  const isValid = await verifyPassword(password, superadminOrg.password_hash);
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (superadminOrg.status !== SUPERADMIN_ACTIVE_STATUS) {
    throw new ApiError(
      403,
      "Your organisation is not active yet. Please contact the Super Admin."
    );
  }

  // 3. Find or sync in OrganisationAdmin db
  let admin = await OrganisationAdmin.findOne({ email: normalizedEmail });
  if (!admin) {
    admin = await OrganisationAdmin.create({
      _id: superadminOrg._id,
      organisation_admin_id: String(superadminOrg._id),
      organisation_id: String(superadminOrg._id),
      name: superadminOrg.organisation_name,
      email: normalizedEmail,
      hashed_password: superadminOrg.password_hash,
      organisation_name: superadminOrg.organisation_name,
      is_active: true,
      source: "super_admin",
      created_at: superadminOrg.created_at || new Date(),
    });
  } else {
    let changed = false;
    if (admin.hashed_password !== superadminOrg.password_hash) {
      admin.hashed_password = superadminOrg.password_hash;
      changed = true;
    }
    if (admin.organisation_name !== superadminOrg.organisation_name) {
      admin.organisation_name = superadminOrg.organisation_name;
      changed = true;
    }
    if (!admin.organisation_admin_id) {
      admin.organisation_admin_id = String(admin._id);
      changed = true;
    }
    if (!admin.organisation_id) {
      admin.organisation_id = String(admin._id);
      changed = true;
    }
    if (changed) {
      await admin.save();
    }
  }

  if (!admin.is_active) {
    throw new ApiError(403, "Organisation Admin account is inactive.");
  }

  const accessToken = createAccessToken(admin._id);
  const refresh = await issueRefreshToken(String(admin._id), ROLE_ADMIN);

  return {
    message: "Login successful.",
    access_token: accessToken,
    refresh_token: refresh.refresh_token,
    token_type: "bearer",
    expires_in: config.JWT_EXPIRY_MINUTES * 60,
    refresh_token_expires_in: refresh.expires_in,
    admin: serializeAdmin(admin),
  };
};

export const loginOrganisationSubadmin = async ({ email, password }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const subadmin = await OrganisationSubAdmin.findOne({ email: normalizedEmail });

  if (!subadmin || !(await verifyPassword(password, subadmin.hashed_password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!subadmin.is_active) {
    throw new ApiError(403, "Your SubAdmin account is blocked.");
  }

  const accessToken = createSubadminAccessToken(subadmin._id);
  const refresh = await issueRefreshToken(String(subadmin._id), ROLE_SUBADMIN);

  return {
    success: true,
    message: "SubAdmin login successful.",
    access_token: accessToken,
    refresh_token: refresh.refresh_token,
    token_type: "bearer",
    expires_in: config.JWT_EXPIRY_MINUTES * 60,
    refresh_token_expires_in: refresh.expires_in,
    subadmin: {
      id: String(subadmin._id),
      name: subadmin.name,
      email: subadmin.email,
      organisation_admin_id: subadmin.organisation_admin_id,
      organisation_name: subadmin.organisation_name,
      status: "active",
    },
  };
};

export const loginOrganisationUser = async ({ email, password }) => {
  const normalizedEmail = String(email).trim().toLowerCase();

  const isAdmin = await OrganisationAdmin.findOne({ email: normalizedEmail }, { _id: 1 });
  let isSubadmin = null;
  if (!isAdmin) {
    isSubadmin = await OrganisationSubAdmin.findOne({ email: normalizedEmail }, { _id: 1 });
  }

  if (isSubadmin) {
    return await loginOrganisationSubadmin({ email: normalizedEmail, password });
  }

  return await loginOrganisationAdmin({ email: normalizedEmail, password });
};

import { refreshOrganisationSession } from "./organisationRefreshToken.controller.js";

export const loginOrganisationUserController = asyncHandler(async (req, res) => {
  const result = await loginOrganisationUser(req.body);
  return res.status(200).json(result);
});

export const refreshOrganisationSessionController = asyncHandler(async (req, res) => {
  const result = await refreshOrganisationSession(req.body.refresh_token);
  return res.status(200).json(result);
});
