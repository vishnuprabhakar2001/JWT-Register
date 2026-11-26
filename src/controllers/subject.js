import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Subject } from "../models/Subject.js";
import { Grade } from "../models/Grade.js";

const ownerFilter = (currentAdmin) => {
  const adminId = currentAdmin._id;
  return {
    $or: [{ created_by: adminId }, { created_by: String(adminId) }],
  };
};

export const addSubject = async (req, res) => {
  const { body, current_admin } = req;
  const adminId = current_admin._id;
  const orgId = String(current_admin.organisation_id || adminId);

  if (!mongoose.Types.ObjectId.isValid(body.grade)) {
    throw new ApiError(400, "Invalid Grade ID.");
  }

  // Ensure grade belongs to this admin
  const grade = await Grade.findOne({
    _id: body.grade,
    ...ownerFilter(current_admin),
  });
  if (!grade) {
    throw new ApiError(404, "Grade not found.");
  }

  const existing = await Subject.findOne({
    subject_name: body.subject_name.trim(),
    grade: body.grade,
    ...ownerFilter(current_admin),
  });
  if (existing) {
    throw new ApiError(409, "Subject already exists for this grade.");
  }

  const newSubject = await Subject.create({
    subject_name: body.subject_name.trim(),
    grade: body.grade,
    organisation_admin_id: String(adminId),
    organisation_id: orgId,
    created_by: adminId,
  });

  const data = {
    id: String(newSubject._id),
    subject_name: newSubject.subject_name,
    grade: String(newSubject.grade),
    created_at: newSubject.created_at,
  };

  return res.status(201).json(new ApiResponse("Subject created successfully.", data));
};

export const updateSubject = async (req, res) => {
  const { subject_id } = req.params;
  const { body, current_admin } = req;

  if (!mongoose.Types.ObjectId.isValid(subject_id)) {
    throw new ApiError(400, "Invalid Subject ID.");
  }

  const subject = await Subject.findOne({
    _id: subject_id,
    ...ownerFilter(current_admin),
  });
  if (!subject) {
    throw new ApiError(404, "Subject not found.");
  }

  if (body.subject_name) {
    subject.subject_name = body.subject_name.trim();
  }
  if (body.grade) {
    if (!mongoose.Types.ObjectId.isValid(body.grade)) {
      throw new ApiError(400, "Invalid Grade ID.");
    }
    const grade = await Grade.findOne({
      _id: body.grade,
      ...ownerFilter(current_admin),
    });
    if (!grade) {
      throw new ApiError(404, "Grade not found.");
    }
    subject.grade = body.grade;
  }

  await subject.save();

  const data = {
    id: String(subject._id),
    subject_name: subject.subject_name,
    grade: String(subject.grade),
    updated_at: subject.updated_at,
  };

  return res.status(200).json(new ApiResponse("Subject updated successfully.", data));
};

export const getSubjectById = async (req, res) => {
  const { subject_id } = req.params;
  const current_admin = req.current_admin;

  if (!mongoose.Types.ObjectId.isValid(subject_id)) {
    throw new ApiError(400, "Invalid Subject ID.");
  }
  const subject = await Subject.findOne({
    _id: subject_id,
    ...ownerFilter(current_admin),
  });
  if (!subject) {
    throw new ApiError(404, "Subject not found.");
  }

  const data = {
    id: String(subject._id),
    subject_name: subject.subject_name,
    grade: String(subject.grade),
    created_at: subject.created_at,
  };

  return res.status(200).json(new ApiResponse("Subject fetched successfully.", data));
};

export const getAllSubjects = async (req, res) => {
  const list = await Subject.find(ownerFilter(req.current_admin)).sort({ created_at: -1 });

  const data = list.map((s) => ({
    id: String(s._id),
    subject_name: s.subject_name,
    grade: String(s.grade),
    created_at: s.created_at,
  }));

  return res.status(200).json(new ApiResponse("Subjects fetched successfully.", data));
};

export const deleteSubject = async (req, res) => {
  const { subject_id } = req.params;
  const current_admin = req.current_admin;

  if (!mongoose.Types.ObjectId.isValid(subject_id)) {
    throw new ApiError(400, "Invalid Subject ID.");
  }
  const result = await Subject.deleteOne({
    _id: subject_id,
    ...ownerFilter(current_admin),
  });
  if (result.deletedCount === 0) {
    throw new ApiError(404, "Subject not found.");
  }

  return res.status(200).json(new ApiResponse("Subject deleted successfully."));
};
