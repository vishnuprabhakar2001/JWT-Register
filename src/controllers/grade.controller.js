import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { Grade } from "../models/Grade.model.js";

const ownerFilter = (currentAdmin) => {
  const adminId = currentAdmin._id;
  return {
    $or: [{ created_by: adminId }, { created_by: String(adminId) }],
  };
};

export const createGrade = async (payload, currentAdmin) => {
  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const existing = await Grade.findOne({
    grade: payload.grade,
    section: payload.section || null,
    ...ownerFilter(currentAdmin),
  });

  if (existing) {
    throw new ApiError(409, "Grade with this section already exists.");
  }

  const newGrade = await Grade.create({
    grade: payload.grade,
    section: payload.section || null,
    organisation_admin_id: String(adminId),
    organisation_id: orgId,
    created_by: adminId,
  });

  return {
    success: true,
    message: "Grade created successfully.",
    data: {
      id: String(newGrade._id),
      grade: newGrade.grade,
      section: newGrade.section,
      created_at: newGrade.created_at,
    },
  };
};

export const updateGrade = async (gradeId, payload, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(gradeId)) {
    throw new ApiError(400, "Invalid Grade ID.");
  }

  const grade = await Grade.findOne({
    _id: gradeId,
    ...ownerFilter(currentAdmin),
  });
  if (!grade) {
    throw new ApiError(404, "Grade not found.");
  }

  if (payload.grade !== undefined) grade.grade = payload.grade;
  if (payload.section !== undefined) grade.section = payload.section;

  await grade.save();

  return {
    success: true,
    message: "Grade updated successfully.",
    data: {
      id: String(grade._id),
      grade: grade.grade,
      section: grade.section,
      updated_at: grade.updated_at,
    },
  };
};

export const getGradeById = async (gradeId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(gradeId)) {
    throw new ApiError(400, "Invalid Grade ID.");
  }
  const grade = await Grade.findOne({
    _id: gradeId,
    ...ownerFilter(currentAdmin),
  });
  if (!grade) {
    throw new ApiError(404, "Grade not found.");
  }
  return {
    success: true,
    message: "Grade fetched successfully.",
    data: {
      id: String(grade._id),
      grade: grade.grade,
      section: grade.section,
      created_at: grade.created_at,
    },
  };
};

export const getAllGrades = async (currentAdmin) => {
  const list = await Grade.find(ownerFilter(currentAdmin)).sort({ created_at: -1 });
  return {
    success: true,
    message: "Grades fetched successfully.",
    data: list.map((g) => ({
      id: String(g._id),
      grade: g.grade,
      section: g.section,
      created_at: g.created_at,
    })),
  };
};

export const deleteGrade = async (gradeId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(gradeId)) {
    throw new ApiError(400, "Invalid Grade ID.");
  }
  const result = await Grade.deleteOne({
    _id: gradeId,
    ...ownerFilter(currentAdmin),
  });
  if (result.deletedCount === 0) {
    throw new ApiError(404, "Grade not found.");
  }
  return {
    success: true,
    message: "Grade deleted successfully.",
    data: null,
  };
};

export const createGradeController = async (req, res) => {
  const result = await createGrade(req.body, req.current_admin);
  return res.status(201).json(result);
};

export const updateGradeController = async (req, res) => {
  const result = await updateGrade(
    req.params.grade_id,
    req.body,
    req.current_admin
  );
  return res.status(200).json(result);
};

export const getGradeByIdController = async (req, res) => {
  const result = await getGradeById(req.params.grade_id, req.current_admin);
  return res.status(200).json(result);
};

export const getAllGradesController = async (req, res) => {
  const result = await getAllGrades(req.current_admin);
  return res.status(200).json(result);
};

export const deleteGradeController = async (req, res) => {
  const result = await deleteGrade(req.params.grade_id, req.current_admin);
  return res.status(200).json(result);
};
