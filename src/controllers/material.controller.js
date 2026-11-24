import asyncHandler from "../middlewares/asyncHandler.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { Material } from "../models/Material.model.js";

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

export const uploadMaterial = async (file, materialTitle, currentAdmin) => {
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

  return {
    success: true,
    message: "Material uploaded successfully.",
    data: {
      material_id: String(material._id),
      material_title: material.material_title,
      file_name: material.file_name,
      file_size: material.file_size,
      file_size_bytes: material.file_size_bytes,
      created_by: String(material.created_by),
      created_at: material.created_at,
    },
  };
};

export const getAllMaterials = async (currentAdmin) => {
  const adminId = String(currentAdmin._id);
  const list = await Material.find({ organisation_admin_id: adminId }).sort({ created_at: -1 });

  return {
    success: true,
    message: "Materials fetched successfully.",
    data: list.map((m) => ({
      material_id: String(m._id),
      material_title: m.material_title,
      file_name: m.file_name,
      file_size: m.file_size,
      file_size_bytes: m.file_size_bytes,
      created_by: String(m.created_by),
      created_at: m.created_at,
    })),
  };
};

export const getMaterialFile = async (materialId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(materialId)) {
    throw new ApiError(400, "Invalid Material ID.");
  }
  const adminId = String(currentAdmin._id);
  const material = await Material.findOne({ _id: materialId, organisation_admin_id: adminId });
  if (!material) {
    throw new ApiError(404, "Material not found.");
  }
  if (!fs.existsSync(material.file_path)) {
    throw new ApiError(404, "File not found on server disk.");
  }

  return {
    file_path: material.file_path,
    file_name: material.file_name,
    mime_type: material.mime_type,
  };
};

export const deleteMaterial = async (materialId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(materialId)) {
    throw new ApiError(400, "Invalid Material ID.");
  }
  const adminId = String(currentAdmin._id);
  const material = await Material.findOne({ _id: materialId, organisation_admin_id: adminId });
  if (!material) {
    throw new ApiError(404, "Material not found.");
  }

  if (fs.existsSync(material.file_path)) {
    try {
      fs.unlinkSync(material.file_path);
    } catch {}
  }

  await Material.deleteOne({ _id: material._id });

  return {
    success: true,
    message: "Material deleted successfully.",
  };
};

// Student APIs
export const getStudentMaterials = async (student) => {
  const orgId = String(student.organisation_id || "");
  const list = await Material.find({ organisation_id: orgId }).sort({ created_at: -1 });

  return {
    success: true,
    message: "Materials fetched successfully.",
    data: list.map((m) => ({
      material_id: String(m._id),
      material_title: m.material_title,
      file_name: m.file_name,
      file_size: m.file_size,
      file_size_bytes: m.file_size_bytes,
      created_by: String(m.created_by),
      created_at: m.created_at,
    })),
  };
};

export const getStudentMaterialDownload = async (materialId, student) => {
  if (!mongoose.Types.ObjectId.isValid(materialId)) {
    throw new ApiError(400, "Invalid Material ID.");
  }
  const orgId = String(student.organisation_id || "");
  const material = await Material.findOne({ _id: materialId, organisation_id: orgId });
  if (!material) {
    throw new ApiError(404, "Material not found.");
  }
  if (!fs.existsSync(material.file_path)) {
    throw new ApiError(404, "File not found on server disk.");
  }

  return {
    file_path: material.file_path,
    file_name: material.file_name,
    mime_type: material.mime_type,
  };
};

export const uploadMaterialController = asyncHandler(async (req, res) => {
  const result = await uploadMaterial(
    req.file,
    req.body.material_title,
    req.current_admin
  );
  return res.status(201).json(result);
});

export const getAllMaterialsController = asyncHandler(async (req, res) => {
  const result = await getAllMaterials(req.current_admin);
  return res.status(200).json(result);
});

export const downloadMaterialController = asyncHandler(async (req, res) => {
  const { file_path, file_name } = await getMaterialFile(
    req.params.material_id,
    req.current_admin
  );
  return res.download(file_path, file_name);
});

export const viewMaterialFileController = asyncHandler(async (req, res) => {
  const { file_path, mime_type } = await getMaterialFile(
    req.params.material_id,
    req.current_admin
  );
  res.setHeader("Content-Type", mime_type);
  return res.sendFile(file_path);
});

export const deleteMaterialController = asyncHandler(async (req, res) => {
  const result = await deleteMaterial(
    req.params.material_id,
    req.current_admin
  );
  return res.status(200).json(result);
});

export const getStudentMaterialsController = asyncHandler(async (req, res) => {
  const result = await getStudentMaterials(req.current_student);
  return res.status(200).json(result);
});

export const downloadStudentMaterialController = asyncHandler(async (req, res) => {
  const { file_path, file_name } = await getStudentMaterialDownload(
    req.params.material_id,
    req.current_student
  );
  return res.download(file_path, file_name);
});
