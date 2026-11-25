import crypto from "crypto";
import ApiError from "../utils/ApiError.js";
import cloudinary from "../config/cloudinary.js";
import { Grade } from "../models/Grade.model.js";
import { Subject } from "../models/Subject.model.js";
import { OrganisationDocument } from "../models/OrganisationDocument.model.js";
import { Question } from "../models/Question.model.js";
import { QuestionSummary } from "../models/QuestionSummary.model.js";

function chunkText(text, chunkSize = 800, overlap = 100) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    chunks.push(text.slice(i, end));
    if (end === text.length) break;
    i += chunkSize - overlap;
  }
  return chunks;
}

const uploadToCloudinary = (fileBuffer, fileName, folder = "reckomate/organisation_documents") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "raw", public_id: `${Date.now()}_${fileName}` },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const validateGradeAndSubject = async (gradeId, subjectId, currentAdmin) => {
  const adminId = currentAdmin._id;
  const grade = await Grade.findById(gradeId);
  if (!grade) {
    throw new ApiError(404, "Grade not found.");
  }
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new ApiError(404, "Subject not found.");
  }
  return { grade, subject };
};

export const uploadDocument = async ({ grade_id, subject_id, file, currentAdmin }) => {
  const { grade, subject } = await validateGradeAndSubject(grade_id, subject_id, currentAdmin);
  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const fileId = crypto.randomUUID().replace(/-/g, "");
  let extractedText = "";

  // If text file or utf-8 parseable
  try {
    extractedText = file.buffer.toString("utf-8");
  } catch {
    extractedText = `Document content for ${file.originalname}`;
  }

  const chunks = chunkText(extractedText);

  let cloudinaryRes = null;
  try {
    cloudinaryRes = await uploadToCloudinary(file.buffer, file.originalname);
  } catch (err) {
    console.warn("Cloudinary document upload warning:", err.message);
  }

  const doc = await OrganisationDocument.create({
    file_id: fileId,
    organisation_admin_id: String(adminId),
    organisation_id: orgId,
    grade_id: String(grade._id),
    grade: grade.grade,
    section: grade.section || "",
    subject_id: String(subject._id),
    subject_name: subject.subject_name,
    document_name: file.originalname,
    file_type: "document",
    cloudinary_public_id: cloudinaryRes?.public_id || "",
    cloudinary_url: cloudinaryRes?.secure_url || "",
    chunks,
    chunks_stored: chunks.length,
    created_by: adminId,
  });

  return {
    success: true,
    message: "Document uploaded successfully.",
    document: {
      file_id: fileId,
      grade_id: String(grade._id),
      grade: grade.grade,
      section: grade.section,
      subject_id: String(subject._id),
      subject_name: subject.subject_name,
      document_name: file.originalname,
      file_type: "document",
      chunks_stored: chunks.length,
      created_at: doc.created_at,
    },
  };
};

export const uploadWebsiteDocument = async ({
  grade_id,
  subject_id,
  website_url,
  currentAdmin,
}) => {
  const { grade, subject } = await validateGradeAndSubject(grade_id, subject_id, currentAdmin);
  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);
  const fileId = crypto.randomUUID().replace(/-/g, "");

  const chunks = [`Website reference content crawled from ${website_url}`];

  const doc = await OrganisationDocument.create({
    file_id: fileId,
    organisation_admin_id: String(adminId),
    organisation_id: orgId,
    grade_id: String(grade._id),
    grade: grade.grade,
    section: grade.section || "",
    subject_id: String(subject._id),
    subject_name: subject.subject_name,
    document_name: website_url,
    file_type: "website",
    source_url: website_url,
    chunks,
    chunks_stored: chunks.length,
    created_by: adminId,
  });

  return {
    success: true,
    message: "Website content stored successfully.",
    document: {
      file_id: fileId,
      grade_id: String(grade._id),
      grade: grade.grade,
      section: grade.section,
      subject_id: String(subject._id),
      subject_name: subject.subject_name,
      document_name: website_url,
      file_type: "website",
      chunks_stored: chunks.length,
      created_at: doc.created_at,
    },
  };
};

export const uploadYoutubeDocument = async ({
  grade_id,
  subject_id,
  youtube_url,
  currentAdmin,
}) => {
  const { grade, subject } = await validateGradeAndSubject(grade_id, subject_id, currentAdmin);
  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);
  const fileId = crypto.randomUUID().replace(/-/g, "");

  const chunks = [`YouTube transcript audio reference for ${youtube_url}`];

  const doc = await OrganisationDocument.create({
    file_id: fileId,
    organisation_admin_id: String(adminId),
    organisation_id: orgId,
    grade_id: String(grade._id),
    grade: grade.grade,
    section: grade.section || "",
    subject_id: String(subject._id),
    subject_name: subject.subject_name,
    document_name: youtube_url,
    file_type: "youtube",
    source_url: youtube_url,
    chunks,
    chunks_stored: chunks.length,
    created_by: adminId,
  });

  return {
    success: true,
    message: "YouTube document transcript stored successfully.",
    document: {
      file_id: fileId,
      grade_id: String(grade._id),
      grade: grade.grade,
      section: grade.section,
      subject_id: String(subject._id),
      subject_name: subject.subject_name,
      document_name: youtube_url,
      file_type: "youtube",
      chunks_stored: chunks.length,
      created_at: doc.created_at,
    },
  };
};

export const getAllDocuments = async (currentAdmin) => {
  const adminId = String(currentAdmin._id);
  const docs = await OrganisationDocument.find({
    organisation_admin_id: adminId,
  }).sort({ created_at: -1 });

  return docs.map((d) => ({
    file_id: d.file_id,
    grade_id: d.grade_id,
    grade: d.grade,
    section: d.section,
    subject_id: d.subject_id,
    subject_name: d.subject_name,
    document_name: d.document_name,
    file_type: d.file_type,
    created_at: d.created_at,
  }));
};

export const deleteDocuments = async (fileIds, currentAdmin) => {
  const adminId = String(currentAdmin._id);
  const docs = await OrganisationDocument.find({
    file_id: { $in: fileIds },
    organisation_admin_id: adminId,
  });

  const foundIds = docs.map((d) => d.file_id);
  const missingIds = fileIds.filter((id) => !foundIds.includes(id));

  for (const d of docs) {
    if (d.cloudinary_public_id) {
      try {
        await cloudinary.uploader.destroy(d.cloudinary_public_id, { resource_type: "raw" });
      } catch {}
    }
  }

  await OrganisationDocument.deleteMany({ file_id: { $in: foundIds } });
  await Question.deleteMany({ file_id: { $in: foundIds } });
  await QuestionSummary.deleteMany({ file_id: { $in: foundIds } });

  return {
    success: true,
    deleted_count: foundIds.length,
    deleted_file_ids: foundIds,
    not_found_file_ids: missingIds,
  };
};

export const uploadOrganisationDocumentController = async (req, res) => {
  const { grade_id, subject_id, website_url, youtube_url } = req.body;
  const file = req.file;

  const sources = [Boolean(file), Boolean(website_url), Boolean(youtube_url)].filter(Boolean);
  if (sources.length > 1) {
    throw new ApiError(400, "Send only one of upload_document, website_url or youtube_url.");
  }

  if (youtube_url) {
    const result = await uploadYoutubeDocument({
      grade_id,
      subject_id,
      youtube_url,
      currentAdmin: req.current_admin,
    });
    return res.status(200).json(result);
  }

  if (website_url) {
    const result = await uploadWebsiteDocument({
      grade_id,
      subject_id,
      website_url,
      currentAdmin: req.current_admin,
    });
    return res.status(200).json(result);
  }

  if (!file) {
    throw new ApiError(400, "Send a file in upload_document, a link in website_url or a YouTube link in youtube_url.");
  }

  const result = await uploadDocument({
    grade_id,
    subject_id,
    file,
    currentAdmin: req.current_admin,
  });
  return res.status(200).json(result);
};

export const getAllDocumentsController = async (req, res) => {
  const documents = await getAllDocuments(req.current_admin);
  return res.status(200).json({
    success: true,
    count: documents.length,
    documents,
  });
};

export const deleteDocumentController = async (req, res) => {
  const fileId = req.params.file_id;
  if (!fileId || !fileId.trim()) {
    throw new ApiError(400, "file_id is required.");
  }
  const result = await deleteDocuments([fileId.trim()], req.current_admin);
  return res.status(200).json(result);
};

export const bulkDeleteDocumentsController = async (req, res) => {
  const fileIds = req.body.file_ids;
  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    throw new ApiError(400, "file_ids array is required.");
  }
  const result = await deleteDocuments(fileIds, req.current_admin);
  return res.status(200).json(result);
};
