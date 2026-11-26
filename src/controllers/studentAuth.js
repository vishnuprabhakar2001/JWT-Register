import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.js";
import { OrganisationAdmin } from "../models/OrganisationAdmin.js";
import { evictStudent } from "../websocket/wsServer.js";

export const CANDIDATE_DB_ROLE = "student";
export const TOKEN_ROLE = "student";
export const TOKEN_ISSUER = "reckomate-api";
export const TOKEN_AUDIENCE = "reckomate-web";

export const DISALLOWED_FCM_PLACEHOLDERS = new Set([
  "string",
  "test",
  "dummy",
  "null",
  "undefined",
  "none",
  "token",
  "fcm_token",
  "device_token",
  "placeholder",
  "sample",
  "fake",
]);

export const MIN_FCM_TOKEN_LENGTH = 32;
export const MAX_FCM_TOKEN_LENGTH = 4096;

/**
 * Validates that OTP is:
 * - Exactly six characters.
 * - ASCII English letters only (A–Z and a–z).
 * - At least one uppercase letter.
 * - At least one lowercase letter.
 * - No numbers, spaces, special characters, or Unicode letters.
 * - Strict case-sensitive (value preserved without modification).
 */
export const validateAlphabeticOtp = (value) => {
  if (typeof value !== "string") {
    throw new ApiError(400, "OTP must be a string.");
  }
  if (value.length !== 6) {
    throw new ApiError(400, "OTP must be exactly 6 characters.");
  }
  if (!/^[A-Za-z]{6}$/.test(value)) {
    throw new ApiError(
      400,
      "OTP must contain only ASCII English letters (A-Z, a-z) without numbers, spaces, or special characters."
    );
  }
  if (!/[A-Z]/.test(value)) {
    throw new ApiError(400, "OTP must contain at least one uppercase letter.");
  }
  if (!/[a-z]/.test(value)) {
    throw new ApiError(400, "OTP must contain at least one lowercase letter.");
  }
  return value;
};

export const isValidFcmTokenFormat = (token) => {
  if (!token || typeof token !== "string") return false;
  const clean = token.trim();
  if (clean.length < MIN_FCM_TOKEN_LENGTH || clean.length > MAX_FCM_TOKEN_LENGTH) return false;
  if (DISALLOWED_FCM_PLACEHOLDERS.has(clean.toLowerCase())) return false;
  return true;
};

export const validateFcmToken = (value, optional = false) => {
  if (value === undefined || value === null) {
    if (optional) return null;
    throw new ApiError(400, "fcm_token is required.");
  }
  if (typeof value !== "string") {
    throw new ApiError(400, "fcm_token must be a string.");
  }
  const clean = value.trim();
  if (!clean) {
    if (optional) return null;
    throw new ApiError(400, "fcm_token cannot be empty.");
  }
  if (DISALLOWED_FCM_PLACEHOLDERS.has(clean.toLowerCase())) {
    throw new ApiError(
      400,
      `fcm_token cannot be a placeholder ('${value}'). Provide a genuine FCM registration token, or omit the field if unavailable.`
    );
  }
  if (clean.length < MIN_FCM_TOKEN_LENGTH) {
    throw new ApiError(
      400,
      `fcm_token length (${clean.length}) is below the minimum required length of ${MIN_FCM_TOKEN_LENGTH} characters.`
    );
  }
  if (clean.length > MAX_FCM_TOKEN_LENGTH) {
    throw new ApiError(
      400,
      `fcm_token length (${clean.length}) exceeds maximum allowed (${MAX_FCM_TOKEN_LENGTH}).`
    );
  }
  return clean;
};

export const normalizePhone = (phone) => {
  const cleaned = String(phone || "").trim().replace(/[^\d+]/g, "");
  const digits = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
  const variants = Array.from(new Set([String(phone || "").trim(), cleaned, digits, `+${digits}`]));
  return { phone_e164: `+${digits}`, phone_variants: variants };
};

export const getOrganisationName = async (organisationId, organisationAdminId = null) => {
  for (const candidate of [organisationId, organisationAdminId]) {
    if (!candidate || !mongoose.Types.ObjectId.isValid(String(candidate))) continue;
    try {
      const org = await OrganisationAdmin.findById(candidate);
      if (org) {
        return org.organisation_name || org.name || "";
      }
    } catch {}
  }
  return "";
};

export const createStudentAccessToken = (studentId, organisationId, phone, sessionId = null) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(studentId),
    student_id: String(studentId),
    organisation_id: String(organisationId),
    phone,
    role: TOKEN_ROLE,
    iss: TOKEN_ISSUER,
    aud: TOKEN_AUDIENCE,
    iat: now,
    exp: now + (Number(config.ACCESS_TOKEN_EXPIRE_MINUTES) || 60) * 60,
    type: "access",
  };
  if (sessionId) {
    payload.sid = sessionId;
  }
  return jwt.sign(payload, config.JWT_SECRET);
};

export const createStudentRefreshToken = (studentId, organisationId, sessionId = null) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(studentId),
    student_id: String(studentId),
    organisation_id: String(organisationId),
    role: TOKEN_ROLE,
    iss: TOKEN_ISSUER,
    aud: TOKEN_AUDIENCE,
    iat: now,
    exp: now + (Number(config.REFRESH_TOKEN_EXPIRE_DAYS) || 7) * 24 * 60 * 60,
    type: "refresh",
  };
  if (sessionId) {
    payload.sid = sessionId;
  }
  return jwt.sign(payload, config.JWT_REFRESH_SECRET_KEY);
};

export const buildStudentUser = async (student, organisationId, phoneFallback, fcmToken, updatedAt) => {
  const organisationName = await getOrganisationName(
    organisationId,
    student.organisation_admin_id
  );

  return {
    id: String(student._id),
    name: student.name || "",
    email: student.email || null,
    phone: student.phone || phoneFallback,
    role: TOKEN_ROLE,
    status: student.status || "active",
    type: student.type || "organisation",
    organisation_id: organisationId,
    organisation_name: organisationName,
    organisation_admin_id: student.organisation_admin_id ? String(student.organisation_admin_id) : null,
    grade_id: student.grade_id ? String(student.grade_id) : null,
    grade: student.grade || null,
    section: student.section || null,
    file_id: student.file_id ? String(student.file_id) : null,
    fcm_token: fcmToken || null,
    created_by: student.created_by ? String(student.created_by) : null,
    created_at: student.created_at || null,
    updated_at: updatedAt,
  };
};

export const verifyStudentOtp = async (req, res) => {
  const { phone, otp, fcm_token } = req.body;

  if (!phone || typeof phone !== "string" || phone.trim().length < 8 || phone.trim().length > 20) {
    throw new ApiError(400, "Valid phone number (8-20 characters) is required.");
  }

  // Validate 6-character mixed-case alphabetic OTP
  validateAlphabeticOtp(otp);

  let validatedFcmToken = null;
  if (fcm_token !== undefined && fcm_token !== null) {
    validatedFcmToken = validateFcmToken(fcm_token, true);
  }

  const { phone_e164, phone_variants } = normalizePhone(phone);

  const matches = await User.find({
    phone: { $in: phone_variants },
    role: CANDIDATE_DB_ROLE,
  }).limit(2);

  if (matches.length === 0) {
    throw new ApiError(404, "Student account not found.");
  }
  if (matches.length > 1) {
    throw new ApiError(409, "Phone number is linked to multiple student accounts.");
  }

  const student = matches[0];
  if (String(student.status || "").toLowerCase() !== "active") {
    throw new ApiError(403, "Student account is inactive.");
  }

  const organisationId = String(student.organisation_id || "");
  if (!organisationId) {
    throw new ApiError(409, "Student organisation ID is missing.");
  }

  const now = new Date();
  const sessionId = crypto.randomUUID().replace(/-/g, "");

  const hasValidFcm = Boolean(validatedFcmToken && isValidFcmTokenFormat(validatedFcmToken));

  const updateFields = {
    otp: "",
    otp_expires_at: null,
    otp_verified_at: now,
    active_session_id: sessionId,
    current_token_sid: sessionId,
    updated_at: now,
  };
  if (hasValidFcm) {
    updateFields.fcm_token = validatedFcmToken;
    updateFields.fcm_token_updated_at = now;
  }

  // Atomic update: only succeeds if OTP matches and is not expired
  const verifiedStudent = await User.findOneAndUpdate(
    {
      _id: student._id,
      phone: student.phone,
      role: CANDIDATE_DB_ROLE,
      status: "active",
      otp,
      otp_expires_at: { $gt: now },
    },
    { $set: updateFields },
    { new: false }
  );

  if (!verifiedStudent) {
    throw new ApiError(401, "Invalid, expired, or already used OTP.");
  }

  const studentId = String(verifiedStudent._id);

  // Evict any existing WebSockets for this student on other devices
  try {
    evictStudent(studentId, sessionId, 1008, "LOGGED_IN_ON_ANOTHER_DEVICE");
  } catch (wsErr) {
    console.debug("[StudentAuth] Error evicting previous session WebSockets:", wsErr?.message);
  }

  const accessToken = createStudentAccessToken(studentId, organisationId, phone_e164, sessionId);
  const refreshToken = createStudentRefreshToken(studentId, organisationId, sessionId);

  const activeFcmToken = hasValidFcm ? validatedFcmToken : verifiedStudent.fcm_token;

  const user = await buildStudentUser(
    verifiedStudent,
    organisationId,
    phone_e164,
    activeFcmToken,
    now
  );

  const data = {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "bearer",
    expires_in: (Number(config.ACCESS_TOKEN_EXPIRE_MINUTES) || 60) * 60,
    user,
  };

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data,
  });
};

export const refreshStudentToken = async (req, res) => {
  const refreshToken = req.body?.refresh_token;
  if (!refreshToken || typeof refreshToken !== "string" || !refreshToken.trim()) {
    throw new ApiError(401, "Refresh token is missing.");
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken.trim(), config.JWT_REFRESH_SECRET_KEY, {
      audience: TOKEN_AUDIENCE,
      issuer: TOKEN_ISSUER,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Refresh token has expired. Please login again.");
    }
    throw new ApiError(401, "Invalid refresh token.");
  }

  if (payload.type !== "refresh") {
    throw new ApiError(401, "Invalid token type: expected refresh token.");
  }

  if (payload.role !== TOKEN_ROLE) {
    throw new ApiError(401, "Unauthorized role: expected student token.");
  }

  const studentId = payload.student_id || payload.sub;
  if (!studentId || !mongoose.Types.ObjectId.isValid(String(studentId))) {
    throw new ApiError(401, "Invalid student ID in token.");
  }

  const student = await User.findOne({
    _id: studentId,
    role: CANDIDATE_DB_ROLE,
  });

  if (!student) {
    throw new ApiError(401, "Student account not found.");
  }

  if (String(student.status || "").toLowerCase() !== "active") {
    throw new ApiError(403, "Student account is inactive.");
  }

  const organisationId = String(student.organisation_id || "");
  if (!organisationId || organisationId !== String(payload.organisation_id || "")) {
    throw new ApiError(401, "Invalid refresh token: organisation mismatch.");
  }

  // Critical single-device session check
  const activeSid = student.active_session_id || student.current_token_sid;
  const tokenSid = payload.sid;

  if (activeSid !== undefined && activeSid !== null) {
    if (tokenSid !== activeSid || (typeof activeSid === "string" && activeSid.startsWith("logged_out_"))) {
      throw new ApiError(401, "SESSION_TERMINATED_BY_ANOTHER_DEVICE");
    }
  }

  const currentSessionId = activeSid || tokenSid;
  const { phone_e164 } = normalizePhone(student.phone);

  const newAccessToken = createStudentAccessToken(
    studentId,
    organisationId,
    phone_e164,
    currentSessionId
  );
  const newRefreshToken = createStudentRefreshToken(studentId, organisationId, currentSessionId);

  const user = await buildStudentUser(
    student,
    organisationId,
    phone_e164,
    student.fcm_token,
    student.updated_at
  );

  const data = {
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
    token_type: "bearer",
    expires_in: (Number(config.ACCESS_TOKEN_EXPIRE_MINUTES) || 60) * 60,
    user,
  };

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data,
  });
};

export const logoutStudent = async (req, res) => {
  const student = req.current_student || req.student;
  const studentId = String(student._id || student.id);
  const currentSid = req.current_student?.current_token_sid || student?.current_token_sid;

  const logoutMarker = `logged_out_${crypto.randomUUID().replace(/-/g, "")}`;
  const now = new Date();

  const query = {
    _id: studentId,
    role: CANDIDATE_DB_ROLE,
  };

  if (currentSid) {
    query.$or = [
      { active_session_id: currentSid },
      { current_token_sid: currentSid },
    ];
  } else {
    query.$or = [
      { active_session_id: { $in: [null, ""] } },
      { current_token_sid: { $in: [null, ""] } },
    ];
  }

  const result = await User.updateOne(
    query,
    {
      $set: {
        active_session_id: logoutMarker,
        current_token_sid: logoutMarker,
        updated_at: now,
      },
      $unset: {
        fcm_token: "",
        fcm_token_updated_at: "",
      },
    }
  );

  if (result.modifiedCount > 0) {
    try {
      evictStudent(studentId, null, 1000, "USER_LOGGED_OUT");
    } catch {}
  }

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const updateStudentFcmToken = async (req, res) => {
  const student = req.current_student || req.student;
  const studentId = String(student._id || student.id);
  const newFcmToken = req.body?.fcm_token;
  const currentSid = req.current_student?.current_token_sid || student?.current_token_sid;

  const validatedToken = validateFcmToken(newFcmToken, false);
  const now = new Date();

  const query = {
    _id: studentId,
    role: CANDIDATE_DB_ROLE,
    status: "active",
  };

  if (currentSid) {
    query.$or = [
      { active_session_id: currentSid },
      { current_token_sid: currentSid },
    ];
  } else {
    query.$or = [
      { active_session_id: { $in: [null, ""] } },
      { current_token_sid: { $in: [null, ""] } },
    ];
  }

  const result = await User.updateOne(
    query,
    {
      $set: {
        fcm_token: validatedToken,
        fcm_token_updated_at: now,
        updated_at: now,
      },
    }
  );

  if (result.matchedCount === 0) {
    throw new ApiError(401, "SESSION_TERMINATED_BY_ANOTHER_DEVICE");
  }

  return res.status(200).json({
    success: true,
    message: "FCM token updated successfully",
  });
};
