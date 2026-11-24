import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import { OrganisationAdmin } from "../models/OrganisationAdmin.model.js";
import { OrganisationSubAdmin } from "../models/OrganisationSubAdmin.model.js";
import { User } from "../models/user.model.js";
import { ensureSuperadminOrganisationActive } from "../utils/superadminStatus.js";

function extractBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7).trim();
}

/**
 * Organisation Admin Only
 */
export const authenticateOrganisationAdmin = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new ApiError(401, "Not authenticated. Token is missing.");
    }

    let payload;
    try {
      payload = jwt.verify(token, config.JWT_SECRET);
    } catch {
      throw new ApiError(401, "Invalid or expired token.");
    }

    const adminId = payload.sub;
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      throw new ApiError(401, "Invalid token credentials.");
    }

    const admin = await OrganisationAdmin.findById(adminId);
    if (!admin) {
      throw new ApiError(401, "Organisation Admin not found.");
    }

    if (!admin.is_active) {
      throw new ApiError(403, "Organisation Admin account is inactive.");
    }

    await ensureSuperadminOrganisationActive(admin);

    req.current_admin = admin;
    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Organisation Actor: Organisation Admin OR Organisation SubAdmin
 */
export const authenticateOrganisationActor = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new ApiError(401, "Not authenticated. Token is missing.");
    }

    let payload;
    try {
      payload = jwt.verify(token, config.JWT_SECRET);
    } catch {
      throw new ApiError(401, "Invalid or expired token.");
    }

    const userId = payload.sub;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(401, "Invalid token credentials.");
    }

    if (payload.actor_role === "organisation_subadmin") {
      const subadmin = await OrganisationSubAdmin.findById(userId);
      if (!subadmin) {
        throw new ApiError(401, "Organisation SubAdmin not found.");
      }
      if (!subadmin.is_active) {
        throw new ApiError(403, "Your SubAdmin account is blocked.");
      }

      const admin = await OrganisationAdmin.findById(subadmin.organisation_admin_id);
      if (!admin) {
        throw new ApiError(401, "Owning Organisation Admin not found.");
      }
      if (!admin.is_active) {
        throw new ApiError(403, "Organisation Admin account is inactive.");
      }

      await ensureSuperadminOrganisationActive(admin);

      // Attach subadmin actor info onto admin representation
      const adminObj = admin.toObject();
      adminObj.actor_role = "organisation_subadmin";
      adminObj.subadmin_id = String(subadmin._id);
      adminObj.subadmin_name = subadmin.name;
      adminObj.subadmin_email = subadmin.email;

      req.current_admin = adminObj;
      req.subadmin = subadmin;
      return next();
    }

    // Default to Organisation Admin
    const admin = await OrganisationAdmin.findById(userId);
    if (!admin) {
      throw new ApiError(401, "Organisation Admin not found.");
    }
    if (!admin.is_active) {
      throw new ApiError(403, "Organisation Admin account is inactive.");
    }

    await ensureSuperadminOrganisationActive(admin);

    const adminObj = admin.toObject();
    adminObj.actor_role = "organisation_admin";
    req.current_admin = adminObj;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Student / Candidate Authentication
 */
export const authenticateStudent = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new ApiError(401, "Not authenticated. Token is missing.");
    }

    let payload;
    try {
      payload = jwt.verify(token, config.JWT_SECRET);
    } catch {
      throw new ApiError(401, "Invalid or expired access token.");
    }

    const studentId = payload.sub;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      throw new ApiError(401, "Invalid access token.");
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      throw new ApiError(401, "Student account not found.");
    }

    if (student.status !== "active") {
      throw new ApiError(403, "Student account is inactive.");
    }

    // Verify session ID (single active device check)
    if (payload.sid && student.current_token_sid && payload.sid !== student.current_token_sid) {
      throw new ApiError(
        401,
        "You have been logged out because your account was logged in from another device."
      );
    }

    const studentObj = student.toObject();
    studentObj.current_token_sid = payload.sid;
    req.current_student = studentObj;
    req.student = studentObj;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Universal Chat User (Student, SubAdmin, or Admin)
 */
export const authenticateChatUser = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new ApiError(401, "Not authenticated. Token is missing.");
    }

    let payload;
    try {
      payload = jwt.verify(token, config.JWT_SECRET);
    } catch {
      throw new ApiError(401, "Invalid or expired token.");
    }

    const userId = payload.sub;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(401, "Invalid token.");
    }

    // Check if student
    const student = await User.findById(userId);
    if (student && student.role === "student" && student.status === "active") {
      req.current_user = {
        id: String(student._id),
        user_id: String(student._id),
        role: "student",
        name: student.name,
        email: student.email,
        phone: student.phone,
        organisation_id: student.organisation_id,
        grade_id: student.grade_id,
        grade: student.grade,
        section: student.section,
      };
      return next();
    }

    // Check if subadmin
    const subadmin = await OrganisationSubAdmin.findById(userId);
    if (subadmin && subadmin.is_active) {
      req.current_user = {
        id: String(subadmin._id),
        user_id: String(subadmin._id),
        role: "organisation_subadmin",
        name: subadmin.name,
        email: subadmin.email,
        organisation_id: subadmin.organisation_admin_id,
        grade_id: null,
      };
      return next();
    }

    // Check if admin
    const admin = await OrganisationAdmin.findById(userId);
    if (admin && admin.is_active) {
      req.current_user = {
        id: String(admin._id),
        user_id: String(admin._id),
        role: "organisation_admin",
        name: admin.name,
        email: admin.email,
        organisation_id: String(admin._id),
        grade_id: null,
      };
      return next();
    }

    throw new ApiError(401, "User not found or inactive.");
  } catch (error) {
    next(error);
  }
};

/**
 * Internal Secret for OTP Sync
 */
export const verifyInternalSecret = (req, res, next) => {
  const secret = req.headers["x-internal-secret"];
  if (!config.OTP_SYNC_SECRET) {
    return next(new ApiError(500, "OTP_SYNC_SECRET is not configured."));
  }
  if (!secret || secret !== config.OTP_SYNC_SECRET) {
    return next(new ApiError(401, "Invalid internal service credentials."));
  }
  next();
};

/**
 * Generic User Auth Middleware
 * Supports cookies (req.cookies.token) and Authorization Bearer header
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      extractBearerToken(req) ||
      req.headers["x-access-token"];

    if (!token) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET || process.env.JWT_SECRET);
    } catch (error) {
      throw new ApiError(401, "Unauthorized: Invalid or expired token");
    }

    const userId = decoded.id || decoded.sub || decoded._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(401, "Unauthorized: Invalid token payload");
    }

    const user = await User.findById(userId).select("-password -hashed_password");
    if (!user) {
      throw new ApiError(401, "Unauthorized: User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;

