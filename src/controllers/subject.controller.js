import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { Subject } from "../models/Subject.model.js";
import { Grade } from "../models/Grade.model.js";

const ownerFilter = (currentAdmin) => {
  const adminId = currentAdmin._id;
  return {
    $or: [{ created_by: adminId }, { created_by: String(adminId) }],
  };
};

export const addSubject = async (payload, currentAdmin) => {
  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  if (!mongoose.Types.ObjectId.isValid(payload.grade)) {
    throw new ApiError(400, "Invalid Grade ID.");
  }

  // Ensure grade belongs to this admin
  const grade = await Grade.findOne({
    _id: payload.grade,
    ...ownerFilter(currentAdmin),
  });
  if (!grade) {
    throw new ApiError(404, "Grade not found.");
  }

  const existing = await Subject.findOne({
    subject_name: payload.subject_name.trim(),
    grade: payload.grade,
    ...ownerFilter(currentAdmin),
  });
  if (existing) {
    throw new ApiError(409, "Subject already exists for this grade.");
  }

  const newSubject = await Subject.create({
    subject_name: payload.subject_name.trim(),
    grade: payload.grade,
    organisation_admin_id: String(adminId),
    organisation_id: orgId,
    created_by: adminId,
  });

  return {
    success: true,
    message: "Subject created successfully.",
    data: {
      id: String(newSubject._id),
      subject_name: newSubject.subject_name,
      grade: String(newSubject.grade),
      created_at: newSubject.created_at,
    },
  };
};

export const updateSubject = async (subjectId, payload, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    throw new ApiError(400, "Invalid Subject ID.");
  }

  const subject = await Subject.findOne({
    _id: subjectId,
    ...ownerFilter(currentAdmin),
  });
  if (!subject) {
    throw new ApiError(404, "Subject not found.");
  }

  if (payload.subject_name) {
    subject.subject_name = payload.subject_name.trim();
  }
  if (payload.grade) {
    if (!mongoose.Types.ObjectId.isValid(payload.grade)) {
      throw new ApiError(400, "Invalid Grade ID.");
    }
    const grade = await Grade.findOne({
      _id: payload.grade,
      ...ownerFilter(currentAdmin),
    });
    if (!grade) {
      throw new ApiError(404, "Grade not found.");
    }
    subject.grade = payload.grade;
  }

  await subject.save();

  return {
    success: true,
    message: "Subject updated successfully.",
    data: {
      id: String(subject._id),
      subject_name: subject.subject_name,
      grade: String(subject.grade),
      updated_at: subject.updated_at,
    },
  };
};

export const getSubjectById = async (subjectId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    throw new ApiError(400, "Invalid Subject ID.");
  }
  const subject = await Subject.findOne({
    _id: subjectId,
    ...ownerFilter(currentAdmin),
  });
  if (!subject) {
    throw new ApiError(404, "Subject not found.");
  }
  return {
    success: true,
    message: "Subject fetched successfully.",
    data: {
      id: String(subject._id),
      subject_name: subject.subject_name,
      grade: String(subject.grade),
      created_at: subject.created_at,
    },
  };
};

export const getAllSubjects = async (currentAdmin) => {
  const list = await Subject.find(ownerFilter(currentAdmin)).sort({ created_at: -1 });
  return {
    success: true,
    message: "Subjects fetched successfully.",
    data: list.map((s) => ({
      id: String(s._id),
      subject_name: s.subject_name,
      grade: String(s.grade),
      created_at: s.created_at,
    })),
  };
};

export const deleteSubject = async (subjectId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    throw new ApiError(400, "Invalid Subject ID.");
  }
  const result = await Subject.deleteOne({
    _id: subjectId,
    ...ownerFilter(currentAdmin),
  });
  if (result.deletedCount === 0) {
    throw new ApiError(404, "Subject not found.");
  }
  return {
    success: true,
    message: "Subject deleted successfully.",
    data: null,
  };
};

export const addSubjectController = async (req, res) => {
  const result = await addSubject(req.body, req.current_admin);
  return res.status(201).json(result);
};

export const updateSubjectController = async (req, res) => {
  const result = await updateSubject(
    req.params.subject_id,
    req.body,
    req.current_admin
  );
  return res.status(200).json(result);
};

export const getSubjectByIdController = async (req, res) => {
  const result = await getSubjectById(
    req.params.subject_id,
    req.current_admin
  );
  return res.status(200).json(result);
};

export const getAllSubjectsController = async (req, res) => {
  const result = await getAllSubjects(req.current_admin);
  return res.status(200).json(result);
};

export const deleteSubjectController = async (req, res) => {
  const result = await deleteSubject(
    req.params.subject_id,
    req.current_admin
  );
  return res.status(200).json(result);
};
