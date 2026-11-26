import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Grade } from "../models/Grade.js";

const ownerFilter = (currentAdmin) => {
  const adminId = currentAdmin._id;
  return {
    $or: [{ created_by: adminId }, { created_by: String(adminId) }],
  };
};

export const createGrade = async (req, res) => {
  const { body, current_admin } = req;
  const adminId = current_admin._id;
  const orgId = String(current_admin.organisation_id || adminId);

  const existing = await Grade.findOne({
    grade: body.grade,
    section: body.section || null,
    ...ownerFilter(current_admin),
  });

  if (existing) {
    throw new ApiError(409, "Grade with this section already exists.");
  }

  const newGrade = await Grade.create({
    grade: body.grade,
    section: body.section || null,
    organisation_admin_id: String(adminId),
    organisation_id: orgId,
    created_by: adminId,
  });

  const data = {
    id: String(newGrade._id),
    grade: newGrade.grade,
    section: newGrade.section,
    created_at: newGrade.created_at,
  };

  return res.status(201).json(new ApiResponse("Grade created successfully.", data));
};

export const updateGrade = async (req, res) => {
  const { grade_id } = req.params;
  const { body, current_admin } = req;

  if (!mongoose.Types.ObjectId.isValid(grade_id)) {
    throw new ApiError(400, "Invalid Grade ID.");
  }

  const grade = await Grade.findOne({
    _id: grade_id,
    ...ownerFilter(current_admin),
  });
  if (!grade) {
    throw new ApiError(404, "Grade not found.");
  }

  if (body.grade !== undefined) grade.grade = body.grade;
  if (body.section !== undefined) grade.section = body.section;

  await grade.save();

  const data = {
    id: String(grade._id),
    grade: grade.grade,
    section: grade.section,
    updated_at: grade.updated_at,
  };

  return res.status(200).json(new ApiResponse("Grade updated successfully.", data));
};

export const getGradeById = async (req, res) => {
  const { grade_id } = req.params;
  const current_admin = req.current_admin;

  if (!mongoose.Types.ObjectId.isValid(grade_id)) {
    throw new ApiError(400, "Invalid Grade ID.");
  }
  const grade = await Grade.findOne({
    _id: grade_id,
    ...ownerFilter(current_admin),
  });
  if (!grade) {
    throw new ApiError(404, "Grade not found.");
  }

  const data = {
    id: String(grade._id),
    grade: grade.grade,
    section: grade.section,
    created_at: grade.created_at,
  };

  return res.status(200).json(new ApiResponse("Grade fetched successfully.", data));
};

export const getAllGrades = async (req, res) => {
  const list = await Grade.find(ownerFilter(req.current_admin)).sort({ created_at: -1 });

  const data = list.map((g) => ({
    id: String(g._id),
    grade: g.grade,
    section: g.section,
    created_at: g.created_at,
  }));

  return res.status(200).json(new ApiResponse("Grades fetched successfully.", data));
};

export const deleteGrade = async (req, res) => {
  const { grade_id } = req.params;
  const current_admin = req.current_admin;

  if (!mongoose.Types.ObjectId.isValid(grade_id)) {
    throw new ApiError(400, "Invalid Grade ID.");
  }
  const result = await Grade.deleteOne({
    _id: grade_id,
    ...ownerFilter(current_admin),
  });
  if (result.deletedCount === 0) {
    throw new ApiError(404, "Grade not found.");
  }

  return res.status(200).json(new ApiResponse("Grade deleted successfully."));
};
