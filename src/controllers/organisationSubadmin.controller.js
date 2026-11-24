import asyncHandler from "../middlewares/asyncHandler.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { hashPassword } from "../utils/security.js";
import { OrganisationSubAdmin } from "../models/OrganisationSubAdmin.model.js";

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

export const createSubAdmin = async (data, currentAdmin) => {
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

  return serializeSubAdmin(subadmin);
};

export const getAllSubAdmins = async (currentAdmin) => {
  const adminId = String(currentAdmin._id);
  const list = await OrganisationSubAdmin.find({
    organisation_admin_id: adminId,
  }).sort({ created_at: -1 });

  return list.map(serializeSubAdmin);
};

export const getSubAdmin = async (subadminId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(subadminId)) {
    throw new ApiError(400, "Invalid SubAdmin ID.");
  }
  const adminId = String(currentAdmin._id);
  const subadmin = await OrganisationSubAdmin.findOne({
    _id: subadminId,
    organisation_admin_id: adminId,
  });
  if (!subadmin) {
    throw new ApiError(404, "SubAdmin not found.");
  }
  return serializeSubAdmin(subadmin);
};

export const updateSubAdmin = async (subadminId, data, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(subadminId)) {
    throw new ApiError(400, "Invalid SubAdmin ID.");
  }
  const adminId = String(currentAdmin._id);
  const subadmin = await OrganisationSubAdmin.findOne({
    _id: subadminId,
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
  return serializeSubAdmin(subadmin);
};

export const deleteSubAdmin = async (subadminId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(subadminId)) {
    throw new ApiError(400, "Invalid SubAdmin ID.");
  }
  const adminId = String(currentAdmin._id);
  const result = await OrganisationSubAdmin.deleteOne({
    _id: subadminId,
    organisation_admin_id: adminId,
  });
  if (result.deletedCount === 0) {
    throw new ApiError(404, "SubAdmin not found.");
  }
  return {
    success: true,
    message: "SubAdmin deleted successfully.",
  };
};

export const blockSubAdmin = async (subadminId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(subadminId)) {
    throw new ApiError(400, "Invalid SubAdmin ID.");
  }
  const adminId = String(currentAdmin._id);
  const subadmin = await OrganisationSubAdmin.findOneAndUpdate(
    { _id: subadminId, organisation_admin_id: adminId },
    { $set: { is_active: false } },
    { new: true }
  );
  if (!subadmin) {
    throw new ApiError(404, "SubAdmin not found.");
  }
  return {
    success: true,
    message: "SubAdmin blocked successfully.",
    data: serializeSubAdmin(subadmin),
  };
};

export const unblockSubAdmin = async (subadminId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(subadminId)) {
    throw new ApiError(400, "Invalid SubAdmin ID.");
  }
  const adminId = String(currentAdmin._id);
  const subadmin = await OrganisationSubAdmin.findOneAndUpdate(
    { _id: subadminId, organisation_admin_id: adminId },
    { $set: { is_active: true } },
    { new: true }
  );
  if (!subadmin) {
    throw new ApiError(404, "SubAdmin not found.");
  }
  return {
    success: true,
    message: "SubAdmin unblocked successfully.",
    data: serializeSubAdmin(subadmin),
  };
};

export const createSubAdminController = asyncHandler(async (req, res) => {
  const result = await createSubAdmin(req.body, req.current_admin);
  return res.status(201).json(result);
});

export const getAllSubAdminsController = asyncHandler(async (req, res) => {
  const result = await getAllSubAdmins(req.current_admin);
  return res.status(200).json(result);
});

export const getSubAdminController = asyncHandler(async (req, res) => {
  const result = await getSubAdmin(req.params.subadmin_id, req.current_admin);
  return res.status(200).json(result);
});

export const updateSubAdminController = asyncHandler(async (req, res) => {
  const result = await updateSubAdmin(
    req.params.subadmin_id,
    req.body,
    req.current_admin
  );
  return res.status(200).json(result);
});

export const deleteSubAdminController = asyncHandler(async (req, res) => {
  const result = await deleteSubAdmin(
    req.params.subadmin_id,
    req.current_admin
  );
  return res.status(200).json(result);
});

export const blockSubAdminController = asyncHandler(async (req, res) => {
  const result = await blockSubAdmin(
    req.params.subadmin_id,
    req.current_admin
  );
  return res.status(200).json(result);
});

export const unblockSubAdminController = asyncHandler(async (req, res) => {
  const result = await unblockSubAdmin(
    req.params.subadmin_id,
    req.current_admin
  );
  return res.status(200).json(result);
});
