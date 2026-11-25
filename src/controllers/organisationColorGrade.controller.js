import ApiError from "../utils/ApiError.js";
import { OrganisationColorGrade } from "../models/OrganisationColorGrade.model.js";

export const createColorGrade = async (payload, currentAdmin) => {
  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const existing = await OrganisationColorGrade.findOne({ organisation_id: orgId });
  if (existing) {
    throw new ApiError(409, "Color grade already configured for your organisation.");
  }

  const newDoc = await OrganisationColorGrade.create({
    organisation_id: orgId,
    organisation_admin_id: String(adminId),
    color_grade: payload.color_grade,
    created_by: adminId,
  });

  return {
    success: true,
    message: "Color grade created successfully.",
    data: {
      color_grade: newDoc.color_grade,
    },
  };
};

export const updateColorGrade = async (payload, currentAdmin) => {
  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const doc = await OrganisationColorGrade.findOneAndUpdate(
    { organisation_id: orgId },
    { $set: { color_grade: payload.color_grade } },
    { new: true, upsert: true }
  );

  return {
    success: true,
    message: "Color grade updated successfully.",
    data: {
      color_grade: doc.color_grade,
    },
  };
};

export const deleteColorGrade = async (currentAdmin) => {
  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const result = await OrganisationColorGrade.deleteOne({ organisation_id: orgId });
  if (result.deletedCount === 0) {
    throw new ApiError(404, "Color grade not found.");
  }

  return {
    success: true,
    message: "Color grade deleted successfully.",
  };
};

export const getColorGrade = async (currentAdmin) => {
  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const doc = await OrganisationColorGrade.findOne({ organisation_id: orgId });
  if (!doc) {
    throw new ApiError(404, "Color grade not configured.");
  }

  return {
    success: true,
    message: "Color grade fetched successfully.",
    data: {
      color_grade: doc.color_grade,
    },
  };
};

export const getStudentColorGrade = async (currentStudent) => {
  const orgId = String(currentStudent.organisation_id || "");
  const doc = await OrganisationColorGrade.findOne({ organisation_id: orgId });
  if (!doc) {
    throw new ApiError(404, "Color grade not configured.");
  }
  return {
    success: true,
    message: "Color grade fetched successfully.",
    data: {
      color_grade: doc.color_grade,
    },
  };
};

export const createColorGradeController = async (req, res) => {
  const result = await createColorGrade(req.body, req.current_admin);
  return res.status(201).json(result);
};

export const updateColorGradeController = async (req, res) => {
  const result = await updateColorGrade(req.body, req.current_admin);
  return res.status(200).json(result);
};

export const deleteColorGradeController = async (req, res) => {
  const result = await deleteColorGrade(req.current_admin);
  return res.status(200).json(result);
};

export const getColorGradeController = async (req, res) => {
  const result = await getColorGrade(req.current_admin);
  return res.status(200).json(result);
};

export const getStudentColorGradeController = async (req, res) => {
  const result = await getStudentColorGrade(req.current_student);
  return res.status(200).json(result);
};
