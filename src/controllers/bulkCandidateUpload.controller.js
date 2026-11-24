import asyncHandler from "../middlewares/asyncHandler.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { Grade } from "../models/Grade.model.js";
import { User } from "../models/user.model.js";
import { BulkCandidateUpload } from "../models/BulkCandidateUpload.model.js";
import { superadminConnection } from "../config/db.js";
import { normalizePhone } from "./studentAuth.controller.js";

const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const createBulkCandidateUpload = async ({ grade_id, file, currentAdmin }) => {
  if (!file) {
    throw new ApiError(400, "Excel file is required.");
  }
  if (!mongoose.Types.ObjectId.isValid(grade_id)) {
    throw new ApiError(400, "Invalid Grade ID.");
  }

  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const gradeDoc = await Grade.findOne({
    _id: grade_id,
    $or: [{ created_by: adminId }, { created_by: String(adminId) }],
  });
  if (!gradeDoc) {
    throw new ApiError(404, "Grade not found.");
  }

  // Parse Excel
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(file.buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new ApiError(400, "Excel workbook is empty.");
  }

  // Find header row: look for Name, Email, Phone
  let nameCol = -1, emailCol = -1, phoneCol = -1, headerRowIdx = -1;

  worksheet.eachRow((row, rowNumber) => {
    if (headerRowIdx !== -1) return;
    row.eachCell((cell, colNumber) => {
      const val = String(cell.value || "").trim().toLowerCase();
      if (val.includes("name") && nameCol === -1) nameCol = colNumber;
      if (val.includes("email") && emailCol === -1) emailCol = colNumber;
      if ((val.includes("phone") || val.includes("mobile") || val.includes("contact")) && phoneCol === -1) {
        phoneCol = colNumber;
      }
    });
    if (nameCol !== -1 && emailCol !== -1 && phoneCol !== -1) {
      headerRowIdx = rowNumber;
    }
  });

  if (headerRowIdx === -1) {
    nameCol = 1; emailCol = 2; phoneCol = 3; headerRowIdx = 1;
  }

  const candidates = [];
  const fileEmails = new Set();
  const filePhones = new Set();
  const internalDuplicates = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowIdx) return;
    const rawName = row.getCell(nameCol).text || String(row.getCell(nameCol).value || "");
    const rawEmail = row.getCell(emailCol).text || String(row.getCell(emailCol).value || "");
    const rawPhone = row.getCell(phoneCol).text || String(row.getCell(phoneCol).value || "");

    const name = rawName.trim();
    const email = rawEmail.trim().toLowerCase();
    const phone = rawPhone.trim();

    if (!name && !email && !phone) return;

    if (!name || !email || !phone) {
      return; // Skip invalid row
    }

    if (fileEmails.has(email)) {
      internalDuplicates.push({ row: rowNumber, field: "email", value: email });
    }
    fileEmails.add(email);

    const { phone_e164 } = normalizePhone(phone);
    if (filePhones.has(phone_e164)) {
      internalDuplicates.push({ row: rowNumber, field: "phone", value: phone });
    }
    filePhones.add(phone_e164);

    candidates.push({
      name,
      email,
      phone: phone_e164,
      rowNumber,
    });
  });

  if (internalDuplicates.length > 0) {
    throw new ApiError(400, "Excel file contains duplicate student emails or phone numbers.", {
      duplicates: internalDuplicates,
    });
  }

  if (candidates.length === 0) {
    throw new ApiError(400, "No valid candidate rows found in the uploaded file.");
  }

  // Check database for conflicting emails or phones
  const emailsList = Array.from(fileEmails);
  const phonesList = Array.from(filePhones);

  const existingInDb = await User.find({
    $or: [{ email: { $in: emailsList } }, { phone: { $in: phonesList } }],
  });

  if (existingInDb.length > 0) {
    const conflicts = existingInDb.map((c) => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
    }));
    throw new ApiError(
      409,
      "Some candidates already exist in the database. Upload cancelled to prevent duplicates.",
      { duplicates: conflicts }
    );
  }

  // Save Excel file to uploads
  const fileId = crypto.randomUUID().replace(/-/g, "");
  const storedName = `${fileId}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = path.join(uploadsDir, storedName);
  await fs.promises.writeFile(filePath, file.buffer);

  const now = new Date();
  const createdByName = currentAdmin.subadmin_name || currentAdmin.name || "";

  const uploadRecord = await BulkCandidateUpload.create({
    organisation_admin_id: String(adminId),
    organisation_id: orgId,
    type: "organisation",
    file_id: fileId,
    grade_id: String(gradeDoc._id),
    grade: gradeDoc.grade,
    section: gradeDoc.section || "",
    file_name: file.originalname,
    stored_name: storedName,
    file_path: filePath,
    file_size: file.size,
    status: "COMPLETED",
    total_rows: candidates.length,
    imported_count: candidates.length,
    failed_count: 0,
    errors: [],
    created_by: String(adminId),
    created_by_name: createdByName,
  });

  // Batch insert users
  const userDocs = candidates.map((c) => ({
    name: c.name,
    email: c.email,
    phone: c.phone,
    role: "student",
    status: "active",
    type: "organisation",
    organisation_admin_id: String(adminId),
    organisation_id: orgId,
    grade_id: String(gradeDoc._id),
    grade: gradeDoc.grade,
    section: gradeDoc.section || "",
    file_id: fileId,
    source_upload_id: String(uploadRecord._id),
    source: "organisation_bulk_upload",
    created_by: adminId,
    created_by_name: createdByName,
  }));

  await User.insertMany(userDocs);

  // Sync to superadmin user collection if connected
  if (superadminConnection) {
    try {
      await superadminConnection.collection("users").insertMany(userDocs);
      await superadminConnection.collection("bulk_candidate_uploads").insertOne(uploadRecord.toObject());
    } catch (err) {
      console.warn("Could not sync bulk upload to superadmin DB:", err.message);
    }
  }

  return {
    success: true,
    message: "Bulk candidates uploaded successfully.",
    data: {
      upload_id: String(uploadRecord._id),
      file_id: fileId,
      total_rows: candidates.length,
      imported_count: candidates.length,
      failed_count: 0,
      file_name: file.originalname,
    },
  };
};

export const listBulkCandidateUploads = async (currentAdmin) => {
  const adminId = String(currentAdmin._id);
  const list = await BulkCandidateUpload.find({
    organisation_admin_id: adminId,
  }).sort({ created_at: -1 });

  return {
    success: true,
    message: "Candidate uploads fetched successfully.",
    data: list.map((u) => ({
      id: String(u._id),
      upload_id: String(u._id),
      file_id: u.file_id,
      grade_id: u.grade_id,
      grade: u.grade,
      section: u.section,
      file_name: u.file_name,
      file_size: u.file_size,
      status: u.status,
      total_rows: u.total_rows,
      imported_count: u.imported_count,
      failed_count: u.failed_count,
      created_by_name: u.created_by_name,
      created_at: u.created_at,
    })),
  };
};

export const getBulkCandidateUpload = async (uploadId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(uploadId)) {
    throw new ApiError(400, "Invalid Upload ID.");
  }
  const adminId = String(currentAdmin._id);
  const upload = await BulkCandidateUpload.findOne({
    _id: uploadId,
    organisation_admin_id: adminId,
  });
  if (!upload) {
    throw new ApiError(404, "Candidate upload not found.");
  }

  const candidates = await User.find({
    source_upload_id: String(upload._id),
  });

  return {
    success: true,
    message: "Candidate upload details fetched successfully.",
    data: {
      upload_id: String(upload._id),
      file_id: upload.file_id,
      grade_id: upload.grade_id,
      grade: upload.grade,
      section: upload.section,
      file_name: upload.file_name,
      total_rows: upload.total_rows,
      imported_count: upload.imported_count,
      failed_count: upload.failed_count,
      candidates: candidates.map((c) => ({
        id: String(c._id),
        name: c.name,
        email: c.email,
        phone: c.phone,
        status: c.status,
      })),
    },
  };
};

export const downloadBulkCandidateUpload = async (uploadId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(uploadId)) {
    throw new ApiError(400, "Invalid Upload ID.");
  }
  const adminId = String(currentAdmin._id);
  const upload = await BulkCandidateUpload.findOne({
    _id: uploadId,
    organisation_admin_id: adminId,
  });
  if (!upload) {
    throw new ApiError(404, "Candidate upload not found.");
  }

  if (!fs.existsSync(upload.file_path)) {
    throw new ApiError(404, "Original uploaded file not found on disk.");
  }

  return {
    file_path: upload.file_path,
    file_name: upload.file_name,
  };
};

export const updateBulkCandidateUpload = async (uploadId, gradeId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(uploadId)) {
    throw new ApiError(400, "Invalid Upload ID.");
  }
  if (!mongoose.Types.ObjectId.isValid(gradeId)) {
    throw new ApiError(400, "Invalid Grade ID.");
  }

  const adminId = currentAdmin._id;
  const gradeDoc = await Grade.findOne({
    _id: gradeId,
    $or: [{ created_by: adminId }, { created_by: String(adminId) }],
  });
  if (!gradeDoc) {
    throw new ApiError(404, "Grade not found.");
  }

  const upload = await BulkCandidateUpload.findOne({
    _id: uploadId,
    organisation_admin_id: String(adminId),
  });
  if (!upload) {
    throw new ApiError(404, "Candidate upload not found.");
  }

  upload.grade_id = String(gradeDoc._id);
  upload.grade = gradeDoc.grade;
  upload.section = gradeDoc.section || "";
  await upload.save();

  // Update candidates
  await User.updateMany(
    { source_upload_id: String(upload._id) },
    {
      $set: {
        grade_id: String(gradeDoc._id),
        grade: gradeDoc.grade,
        section: gradeDoc.section || "",
      },
    }
  );

  return {
    success: true,
    message: "Upload grade updated successfully.",
    data: {
      upload_id: String(upload._id),
      grade_id: upload.grade_id,
      grade: upload.grade,
      section: upload.section,
    },
  };
};

export const deleteBulkCandidateUpload = async (uploadId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(uploadId)) {
    throw new ApiError(400, "Invalid Upload ID.");
  }
  const adminId = String(currentAdmin._id);
  const upload = await BulkCandidateUpload.findOne({
    _id: uploadId,
    organisation_admin_id: adminId,
  });
  if (!upload) {
    throw new ApiError(404, "Candidate upload not found.");
  }

  // Delete candidates
  await User.deleteMany({ source_upload_id: String(upload._id) });
  if (superadminConnection) {
    try {
      await superadminConnection.collection("users").deleteMany({ source_upload_id: String(upload._id) });
      await superadminConnection.collection("bulk_candidate_uploads").deleteOne({ _id: upload._id });
    } catch {}
  }

  // Delete file from disk
  if (fs.existsSync(upload.file_path)) {
    try {
      fs.unlinkSync(upload.file_path);
    } catch {}
  }

  await BulkCandidateUpload.deleteOne({ _id: upload._id });

  return {
    success: true,
    message: "Upload and associated candidates deleted successfully.",
  };
};

export const bulkDeleteCandidateUploads = async (uploadIds, currentAdmin) => {
  if (!Array.isArray(uploadIds) || uploadIds.length === 0) {
    throw new ApiError(400, "upload_ids array is required.");
  }
  const adminId = String(currentAdmin._id);
  const validIds = uploadIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  const uploads = await BulkCandidateUpload.find({
    _id: { $in: validIds },
    organisation_admin_id: adminId,
  });

  const foundIds = uploads.map((u) => String(u._id));
  await User.deleteMany({ source_upload_id: { $in: foundIds } });
  if (superadminConnection) {
    try {
      await superadminConnection.collection("users").deleteMany({ source_upload_id: { $in: foundIds } });
      await superadminConnection.collection("bulk_candidate_uploads").deleteMany({ _id: { $in: validIds } });
    } catch {}
  }

  for (const u of uploads) {
    if (fs.existsSync(u.file_path)) {
      try {
        fs.unlinkSync(u.file_path);
      } catch {}
    }
  }

  await BulkCandidateUpload.deleteMany({ _id: { $in: foundIds } });

  return {
    success: true,
    message: "Candidate uploads deleted successfully.",
    data: {
      deleted_count: foundIds.length,
    },
  };
};

export const deleteBulkCandidates = async (candidateIds, currentAdmin) => {
  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    throw new ApiError(400, "candidate_ids array is required.");
  }
  const adminId = String(currentAdmin._id);
  const validIds = candidateIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  const res = await User.deleteMany({
    _id: { $in: validIds },
    organisation_admin_id: adminId,
  });

  if (superadminConnection) {
    try {
      await superadminConnection.collection("users").deleteMany({ _id: { $in: validIds } });
    } catch {}
  }

  return {
    success: true,
    message: "Candidates deleted successfully.",
    data: {
      deleted_count: res.deletedCount,
    },
  };
};

import { createCandidates } from "./singleCandidateUpload.controller.js";

export const createBulkCandidateUploadController = asyncHandler(async (req, res) => {
  const result = await createBulkCandidateUpload({
    grade_id: req.body.grade_id,
    file: req.file,
    currentAdmin: req.current_admin,
  });
  return res.status(200).json(result);
});

export const listBulkCandidateUploadsController = asyncHandler(async (req, res) => {
  const result = await listBulkCandidateUploads(req.current_admin);
  return res.status(200).json(result);
});

export const downloadBulkCandidateUploadController = asyncHandler(async (req, res) => {
  const { file_path, file_name } = await downloadBulkCandidateUpload(
    req.params.upload_id,
    req.current_admin
  );
  return res.download(file_path, file_name);
});

export const getBulkCandidateUploadErrorsController = asyncHandler(async (req, res) => {
  const result = await getBulkCandidateUpload(
    req.params.upload_id,
    req.current_admin
  );
  return res.status(200).json({
    success: true,
    errors: result.data.errors || [],
  });
});

export const bulkDeleteCandidateUploadsController = asyncHandler(async (req, res) => {
  const result = await bulkDeleteCandidateUploads(
    req.body.upload_ids,
    req.current_admin
  );
  return res.status(200).json(result);
});

export const deleteBulkCandidatesController = asyncHandler(async (req, res) => {
  const result = await deleteBulkCandidates(
    req.body.candidate_ids,
    req.current_admin
  );
  return res.status(200).json(result);
});

export const createCandidatesController = asyncHandler(async (req, res) => {
  const result = await createCandidates({
    payload: req.body,
    currentAdmin: req.current_admin,
  });
  return res.status(200).json(result);
});

export const getBulkCandidateUploadController = asyncHandler(async (req, res) => {
  const result = await getBulkCandidateUpload(
    req.params.upload_id,
    req.current_admin
  );
  return res.status(200).json(result);
});

export const updateBulkCandidateUploadController = asyncHandler(async (req, res) => {
  const result = await updateBulkCandidateUpload(
    req.params.upload_id,
    req.body.grade_id,
    req.current_admin
  );
  return res.status(200).json(result);
});

export const deleteBulkCandidateUploadController = asyncHandler(async (req, res) => {
  const result = await deleteBulkCandidateUpload(
    req.params.upload_id,
    req.current_admin
  );
  return res.status(200).json(result);
});
