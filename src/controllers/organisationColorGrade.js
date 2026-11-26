import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { OrganisationColorGrade } from "../models/OrganisationColorGrade.js";

export const createColorGrade = async (req, res) => {
  const { body, current_admin } = req;
  const adminId = current_admin._id;
  const orgId = String(current_admin.organisation_id || adminId);

  const existing = await OrganisationColorGrade.findOne({ organisation_id: orgId });
  if (existing) {
    throw new ApiError(409, "Color grade already configured for your organisation.");
  }

  const newDoc = await OrganisationColorGrade.create({
    organisation_id: orgId,
    organisation_admin_id: String(adminId),
    color_grade: body.color_grade,
    created_by: adminId,
  });

  const data = {
    color_grade: newDoc.color_grade,
  };

  return res.status(201).json(new ApiResponse("Color grade created successfully.", data));
};

export const updateColorGrade = async (req, res) => {
  const { body, current_admin } = req;
  const adminId = current_admin._id;
  const orgId = String(current_admin.organisation_id || adminId);

  const doc = await OrganisationColorGrade.findOneAndUpdate(
    { organisation_id: orgId },
    { $set: { color_grade: body.color_grade } },
    { new: true, upsert: true }
  );

  const data = {
    color_grade: doc.color_grade,
  };

  return res.status(200).json(new ApiResponse("Color grade updated successfully.", data));
};

export const deleteColorGrade = async (req, res) => {
  const current_admin = req.current_admin;
  const adminId = current_admin._id;
  const orgId = String(current_admin.organisation_id || adminId);

  const result = await OrganisationColorGrade.deleteOne({ organisation_id: orgId });
  if (result.deletedCount === 0) {
    throw new ApiError(404, "Color grade not found.");
  }

  return res.status(200).json(new ApiResponse("Color grade deleted successfully."));
};

export const getColorGrade = async (req, res) => {
  const current_admin = req.current_admin;
  const adminId = current_admin._id;
  const orgId = String(current_admin.organisation_id || adminId);

  const doc = await OrganisationColorGrade.findOne({ organisation_id: orgId });
  if (!doc) {
    throw new ApiError(404, "Color grade not configured.");
  }

  const data = {
    color_grade: doc.color_grade,
  };

  return res.status(200).json(new ApiResponse("Color grade fetched successfully.", data));
};

export const getStudentColorGrade = async (req, res) => {
  const currentStudent = req.current_student;
  const orgId = String(currentStudent.organisation_id || "");
  const doc = await OrganisationColorGrade.findOne({ organisation_id: orgId });
  if (!doc) {
    throw new ApiError(404, "Color grade not configured.");
  }

  const data = {
    color_grade: doc.color_grade,
  };

  return res.status(200).json(new ApiResponse("Color grade fetched successfully.", data));
};
