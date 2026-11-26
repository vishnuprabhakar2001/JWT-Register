import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { hashPassword } from "../utils/security.js";
import { OrganisationSubAdmin } from "../models/OrganisationSubAdmin.js";

const serializeSubAdmin = (doc) => ({
  id: String(doc._id),
  name: doc.name,
  email: doc.email,
  organisation_admin_id: String(doc.organisation_admin_id),
  organisation_name: doc.organisation_name,
  is_active: doc.is_active,
  created_at: doc.created_at ? doc.created_at.toISOString() : new Date().toISOString(),
  updated_at: doc.updated_at ? doc.updated_at.toISOString() : null,
});

export const createSubAdmin = async (req, res) => {
  const data = req.body;
  const currentAdmin = req.current_admin;
  const adminId = String(currentAdmin._id);
  const email = String(data.email).trim().toLowerCase();

  const existing = await OrganisationSubAdmin.findOne({
    organisation_admin_id: adminId,
    email,
  });
  if (existing) {
    throw new ApiError(409, "A SubAdmin with this email already exists for your organisation.");
  }

  const hashedPassword = await hashPassword(data.password);
  const subadmin = await OrganisationSubAdmin.create({
    name: data.name,
    email,
    hashed_password: hashedPassword,
    organisation_admin_id: adminId,
    organisation_name: currentAdmin.organisation_name,
    is_active: true,
  });

  return res.status(201).json(new ApiResponse("SubAdmin created successfully.", serializeSubAdmin(subadmin)));
};

export const getAllSubAdmins = async (req, res) => {
  const currentAdmin = req.current_admin;
  const adminId = String(currentAdmin._id);
  const list = await OrganisationSubAdmin.find({
    organisation_admin_id: adminId,
  }).sort({ created_at: -1 });

  return res.status(200).json(new ApiResponse("SubAdmins fetched successfully.", list.map(serializeSubAdmin)));
};

export const getSubAdmin = async (req, res) => {
  const { subadmin_id } = req.params;
  const currentAdmin = req.current_admin;

  if (!mongoose.Types.ObjectId.isValid(subadmin_id)) {
    throw new ApiError(400, "Invalid SubAdmin ID.");
  }
  const adminId = String(currentAdmin._id);
  const subadmin = await OrganisationSubAdmin.findOne({
    _id: subadmin_id,
    organisation_admin_id: adminId,
  });
  if (!subadmin) {
    throw new ApiError(404, "SubAdmin not found.");
  }
  return res.status(200).json(new ApiResponse("SubAdmin fetched successfully.", serializeSubAdmin(subadmin)));
};

export const updateSubAdmin = async (req, res) => {
  const { subadmin_id } = req.params;
  const data = req.body;
  const currentAdmin = req.current_admin;

  if (!mongoose.Types.ObjectId.isValid(subadmin_id)) {
    throw new ApiError(400, "Invalid SubAdmin ID.");
  }
  const adminId = String(currentAdmin._id);
  const subadmin = await OrganisationSubAdmin.findOne({
    _id: subadmin_id,
    organisation_admin_id: adminId,
  });
  if (!subadmin) {
    throw new ApiError(404, "SubAdmin not found.");
  }

  if (data.name) subadmin.name = data.name;
  if (data.email) {
    const newEmail = String(data.email).trim().toLowerCase();
    const clash = await OrganisationSubAdmin.findOne({
      organisation_admin_id: adminId,
      email: newEmail,
      _id: { $ne: subadmin._id },
    });
    if (clash) {
      throw new ApiError(409, "A SubAdmin with this email already exists.");
    }
    subadmin.email = newEmail;
  }
  if (data.password) {
    subadmin.hashed_password = await hashPassword(data.password);
  }
  if (data.is_active !== undefined) {
    subadmin.is_active = data.is_active;
  }

  await subadmin.save();
  return res.status(200).json(new ApiResponse("SubAdmin updated successfully.", serializeSubAdmin(subadmin)));
};

export const deleteSubAdmin = async (req, res) => {
  const { subadmin_id } = req.params;
  const currentAdmin = req.current_admin;

  if (!mongoose.Types.ObjectId.isValid(subadmin_id)) {
    throw new ApiError(400, "Invalid SubAdmin ID.");
  }
  const adminId = String(currentAdmin._id);
  const result = await OrganisationSubAdmin.deleteOne({
    _id: subadmin_id,
    organisation_admin_id: adminId,
  });
  if (result.deletedCount === 0) {
    throw new ApiError(404, "SubAdmin not found.");
  }
  return res.status(200).json(new ApiResponse("SubAdmin deleted successfully."));
};

export const blockSubAdmin = async (req, res) => {
  const { subadmin_id } = req.params;
  const currentAdmin = req.current_admin;

  if (!mongoose.Types.ObjectId.isValid(subadmin_id)) {
    throw new ApiError(400, "Invalid SubAdmin ID.");
  }
  const adminId = String(currentAdmin._id);
  const subadmin = await OrganisationSubAdmin.findOneAndUpdate(
    { _id: subadmin_id, organisation_admin_id: adminId },
    { $set: { is_active: false } },
    { new: true }
  );
  if (!subadmin) {
    throw new ApiError(404, "SubAdmin not found.");
  }
  return res.status(200).json(new ApiResponse("SubAdmin blocked successfully.", serializeSubAdmin(subadmin)));
};

export const unblockSubAdmin = async (req, res) => {
  const { subadmin_id } = req.params;
  const currentAdmin = req.current_admin;

  if (!mongoose.Types.ObjectId.isValid(subadmin_id)) {
    throw new ApiError(400, "Invalid SubAdmin ID.");
  }
  const adminId = String(currentAdmin._id);
  const subadmin = await OrganisationSubAdmin.findOneAndUpdate(
    { _id: subadmin_id, organisation_admin_id: adminId },
    { $set: { is_active: true } },
    { new: true }
  );
  if (!subadmin) {
    throw new ApiError(404, "SubAdmin not found.");
  }
  return res.status(200).json(new ApiResponse("SubAdmin unblocked successfully.", serializeSubAdmin(subadmin)));
};
