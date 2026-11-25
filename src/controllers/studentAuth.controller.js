import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { OrganisationAdmin } from "../models/OrganisationAdmin.model.js";

export const CANDIDATE_DB_ROLE = "student";
export const TOKEN_ROLE = "student";
export const TOKEN_ISSUER = "reckomate-api";
export const TOKEN_AUDIENCE = "reckomate-web";

export const normalizePhone = (phone) => {
  const cleaned = String(phone || "").trim().replace(/[^\d+]/g, "");
  const digits = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
  const variants = Array.from(new Set([cleaned, digits, `+${digits}`]));
  return { phone_e164: `+${digits}`, phone_variants: variants };
};

export const getOrganisationName = async (organisationId, organisationAdminId = null) => {
  for (const candidate of [organisationId, organisationAdminId]) {
    if (!candidate) continue;
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
    exp: now + config.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
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
    exp: now + config.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
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

export const verifyStudentOtp = async ({ phone, otp, fcm_token }) => {
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
  if (String(student.status).toLowerCase() !== "active") {
    throw new ApiError(403, "Student account is inactive.");
  }

  const organisationId = String(student.organisation_id || "");
  if (!organisationId) {
    throw new ApiError(409, "Student organisation ID is missing.");
  }

  const now = new Date();
  const sessionId = crypto.randomUUID().replace(/-/g, "");

  const updateFields = {
    otp: "",
    otp_expires_at: null,
    current_token_sid: sessionId,
    updated_at: now,
  };
  if (fcm_token) {
    updateFields.fcm_token = fcm_token;
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
    { new: true }
  );

  if (!verifiedStudent) {
    throw new ApiError(401, "Invalid, expired, or already used OTP.");
  }

  const studentId = String(verifiedStudent._id);
  const accessToken = createStudentAccessToken(studentId, organisationId, phone_e164, sessionId);
  const refreshToken = createStudentRefreshToken(studentId, organisationId, sessionId);

  const user = await buildStudentUser(
    verifiedStudent,
    organisationId,
    phone_e164,
    verifiedStudent.fcm_token,
    now
  );

  return {
    success: true,
    message: "OTP verified successfully.",
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "bearer",
      user,
    },
  };
};

export const refreshStudentToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is missing.");
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET_KEY);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }

  if (payload.type !== "refresh") {
    throw new ApiError(401, "Invalid token type.");
  }

  const studentId = payload.sub;
  const student = await User.findById(studentId);
  if (!student || student.role !== CANDIDATE_DB_ROLE || student.status !== "active") {
    throw new ApiError(401, "Student account not found or inactive.");
  }

  const sessionId = crypto.randomUUID().replace(/-/g, "");
  const now = new Date();
  student.current_token_sid = sessionId;
  await student.save();

  const organisationId = String(student.organisation_id || "");
  const newAccessToken = createStudentAccessToken(
    studentId,
    organisationId,
    student.phone,
    sessionId
  );
  const newRefreshToken = createStudentRefreshToken(studentId, organisationId, sessionId);

  const user = await buildStudentUser(
    student,
    organisationId,
    student.phone,
    student.fcm_token,
    now
  );

  return {
    success: true,
    message: "Token refreshed successfully.",
    data: {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      token_type: "bearer",
      user,
    },
  };
};

export const logoutStudent = async (student, currentSessionId = null) => {
  await User.updateOne(
    { _id: student._id },
    { $set: { current_token_sid: null, fcm_token: null } }
  );

  return {
    success: true,
    message: "Logged out successfully.",
  };
};

export const updateStudentFcmToken = async (student, newFcmToken, currentSessionId = null) => {
  await User.updateOne(
    { _id: student._id },
    { $set: { fcm_token: newFcmToken } }
  );

  return {
    success: true,
    message: "FCM token updated successfully.",
  };
};

export const verifyStudentOtpController = async (req, res) => {
  const result = await verifyStudentOtp(req.body);
  return res.status(200).json(result);
};

export const refreshStudentTokenController = async (req, res) => {
  const result = await refreshStudentToken(req.body.refresh_token);
  return res.status(200).json(result);
};

export const logoutStudentController = async (req, res) => {
  const result = await logoutStudent(
    req.current_student,
    req.current_student.current_token_sid
  );
  return res.status(200).json(result);
};

export const updateStudentFcmTokenController = async (req, res) => {
  const result = await updateStudentFcmToken(
    req.current_student,
    req.body.fcm_token,
    req.current_student.current_token_sid
  );
  return res.status(200).json(result);
};
