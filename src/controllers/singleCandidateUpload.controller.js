import fs from "fs";
import ExcelJS from "exceljs";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Grade } from "../models/Grade.model.js";
import { BulkCandidateUpload } from "../models/BulkCandidateUpload.model.js";
import { normalizePhone } from "./studentAuth.controller.js";
import { superadminConnection } from "../config/db.js";

export const createCandidates = async ({ payload, currentAdmin }) => {
  const { grade_id, file_id, candidates } = payload;
  if (!grade_id || !file_id || !Array.isArray(candidates) || candidates.length === 0) {
    throw new ApiError(400, "grade_id, file_id and candidates array are required.");
  }

  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const upload = await BulkCandidateUpload.findOne({
    file_id,
    grade_id,
    organisation_admin_id: String(adminId),
  });
  if (!upload) {
    throw new ApiError(404, "Matching bulk candidate upload not found for this grade and file ID.");
  }

  const gradeDoc = await Grade.findById(grade_id);
  if (!gradeDoc) {
    throw new ApiError(404, "Grade not found.");
  }

  // Check duplicate emails and phones within request
  const reqEmails = new Set();
  const reqPhones = new Set();
  const validCandidates = [];

  for (const c of candidates) {
    const name = String(c.name || "").trim();
    const email = String(c.email || "").trim().toLowerCase();
    const phone = String(c.phone || "").trim();

    if (!name || !email || !phone) {
      throw new ApiError(400, "All candidates must have name, email, and phone.");
    }
    if (reqEmails.has(email) || reqPhones.has(phone)) {
      throw new ApiError(400, `Duplicate email or phone within request: ${email} / ${phone}`);
    }
    reqEmails.add(email);
    const { phone_e164 } = normalizePhone(phone);
    reqPhones.add(phone_e164);

    validCandidates.push({
      name,
      email,
      phone: phone_e164,
    });
  }

  // Check database for existing
  const existingInDb = await User.find({
    $or: [
      { email: { $in: Array.from(reqEmails) } },
      { phone: { $in: Array.from(reqPhones) } },
    ],
  });
  if (existingInDb.length > 0) {
    const conflicts = existingInDb.map((c) => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
    }));
    throw new ApiError(409, "Some candidates already exist in the database.", {
      duplicates: conflicts,
    });
  }

  const now = new Date();
  const createdByName = currentAdmin.subadmin_name || currentAdmin.name || "";

  const userDocs = validCandidates.map((c) => ({
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
    file_id,
    source_upload_id: String(upload._id),
    source: "organisation_single_upload",
    created_by: adminId,
    created_by_name: createdByName,
    created_at: now,
    updated_at: now,
  }));

  const inserted = await User.insertMany(userDocs);

  // Sync to superadmin user collection
  if (superadminConnection) {
    try {
      await superadminConnection.collection("users").insertMany(userDocs);
    } catch {}
  }

  // Update Excel file on disk if exists
  if (fs.existsSync(upload.file_path)) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(upload.file_path);
      const worksheet = workbook.worksheets[0];
      if (worksheet) {
        validCandidates.forEach((c) => {
          worksheet.addRow([c.name, c.email, c.phone]);
        });
        await workbook.xlsx.writeFile(upload.file_path);
      }
    } catch (err) {
      console.warn("Could not append rows to excel on disk:", err.message);
    }
  }

  upload.total_rows += inserted.length;
  upload.imported_count += inserted.length;
  await upload.save();

  return {
    success: true,
    message: `${inserted.length} candidate(s) added successfully.`,
    data: {
      added_count: inserted.length,
      total_rows: upload.total_rows,
      imported_count: upload.imported_count,
    },
  };
};
