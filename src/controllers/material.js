import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Material } from "../models/Material.js";

const materialsDir = path.resolve("uploads/materials");
if (!fs.existsSync(materialsDir)) {
  fs.mkdirSync(materialsDir, { recursive: true });
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export const uploadMaterial = async (req, res) => {
  const file = req.file;
  const materialTitle = req.body?.material_title;
  const currentAdmin = req.current_admin;

  if (!file) {
    throw new ApiError(400, "Material file is required.");
  }
  if (!materialTitle || !materialTitle.trim()) {
    throw new ApiError(400, "material_title is required.");
  }

  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const safeName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = path.join(materialsDir, safeName);
  await fs.promises.writeFile(filePath, file.buffer);

  const formattedSize = formatBytes(file.size);

  const material = await Material.create({
    material_title: materialTitle.trim(),
    file_name: file.originalname,
    file_path: filePath,
    file_size: formattedSize,
    file_size_bytes: file.size,
    mime_type: file.mimetype || "application/octet-stream",
    organisation_admin_id: String(adminId),
    organisation_id: orgId,
    created_by: adminId,
  });

  const data = {
    material_id: String(material._id),
    material_title: material.material_title,
    file_name: material.file_name,
    file_size: material.file_size,
    file_size_bytes: material.file_size_bytes,
    created_by: String(material.created_by),
    created_at: material.created_at,
  };

  return res.status(201).json(new ApiResponse("Material uploaded successfully.", data));
};

export const getAllMaterials = async (req, res) => {
  const adminId = String(req.current_admin._id);
  const list = await Material.find({ organisation_admin_id: adminId }).sort({ created_at: -1 });

  const data = list.map((m) => ({
    material_id: String(m._id),
    material_title: m.material_title,
    file_name: m.file_name,
    file_size: m.file_size,
    file_size_bytes: m.file_size_bytes,
    created_by: String(m.created_by),
    created_at: m.created_at,
  }));

  return res.status(200).json(new ApiResponse("Materials fetched successfully.", data));
};

export const downloadMaterial = async (req, res) => {
  const { material_id } = req.params;
  const adminId = String(req.current_admin._id);

  if (!mongoose.Types.ObjectId.isValid(material_id)) {
    throw new ApiError(400, "Invalid Material ID.");
  }
  const material = await Material.findOne({ _id: material_id, organisation_admin_id: adminId });
  if (!material) {
    throw new ApiError(404, "Material not found.");
  }
  if (!fs.existsSync(material.file_path)) {
    throw new ApiError(404, "File not found on server disk.");
  }

  return res.download(material.file_path, material.file_name);
};

export const viewMaterialFile = async (req, res) => {
  const { material_id } = req.params;
  const adminId = String(req.current_admin._id);

  if (!mongoose.Types.ObjectId.isValid(material_id)) {
    throw new ApiError(400, "Invalid Material ID.");
  }
  const material = await Material.findOne({ _id: material_id, organisation_admin_id: adminId });
  if (!material) {
    throw new ApiError(404, "Material not found.");
  }
  if (!fs.existsSync(material.file_path)) {
    throw new ApiError(404, "File not found on server disk.");
  }

  res.setHeader("Content-Type", material.mime_type);
  return res.sendFile(material.file_path);
};

export const deleteMaterial = async (req, res) => {
  const { material_id } = req.params;
  const adminId = String(req.current_admin._id);

  if (!mongoose.Types.ObjectId.isValid(material_id)) {
    throw new ApiError(400, "Invalid Material ID.");
  }
  const material = await Material.findOne({ _id: material_id, organisation_admin_id: adminId });
  if (!material) {
    throw new ApiError(404, "Material not found.");
  }

  if (fs.existsSync(material.file_path)) {
    try {
      fs.unlinkSync(material.file_path);
    } catch {}
  }

  await Material.deleteOne({ _id: material._id });

  return res.status(200).json(new ApiResponse("Material deleted successfully."));
};

// Student APIs
export const getStudentMaterials = async (req, res) => {
  const student = req.current_student;
  const orgId = String(student.organisation_id || "");
  const list = await Material.find({ organisation_id: orgId }).sort({ created_at: -1 });

  const data = list.map((m) => ({
    material_id: String(m._id),
    material_title: m.material_title,
    file_name: m.file_name,
    file_size: m.file_size,
    file_size_bytes: m.file_size_bytes,
    created_by: String(m.created_by),
    created_at: m.created_at,
  }));

  return res.status(200).json(new ApiResponse("Materials fetched successfully.", data));
};

export const downloadStudentMaterial = async (req, res) => {
  const { material_id } = req.params;
  const student = req.current_student;
  const orgId = String(student.organisation_id || "");

  if (!mongoose.Types.ObjectId.isValid(material_id)) {
    throw new ApiError(400, "Invalid Material ID.");
  }
  const material = await Material.findOne({ _id: material_id, organisation_id: orgId });
  if (!material) {
    throw new ApiError(404, "Material not found.");
  }
  if (!fs.existsSync(material.file_path)) {
    throw new ApiError(404, "File not found on server disk.");
  }

  return res.download(material.file_path, material.file_name);
};
