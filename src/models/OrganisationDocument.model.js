import mongoose from "mongoose";

const organisationDocumentSchema = new mongoose.Schema(
  {
    file_id: { type: String, required: true, unique: true, index: true },
    organisation_admin_id: { type: String, required: true, index: true },
    organisation_id: { type: String, required: true, index: true },
    grade_id: { type: String, required: true, index: true },
    grade: { type: String, required: true },
    section: { type: String, default: "" },
    subject_id: { type: String, required: true, index: true },
    subject_name: { type: String, required: true },
    document_name: { type: String, required: true },
    file_type: { type: String, default: "document" },
    source_url: { type: String, default: "" },
    cloudinary_public_id: { type: String, default: "" },
    cloudinary_url: { type: String, default: "" },
    chunks: { type: [mongoose.Schema.Types.Mixed], default: [] },
    chunks_stored: { type: Number, default: 0 },
    created_by: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "organisation_documents",
  }
);

organisationDocumentSchema.index({ organisation_admin_id: 1, created_at: -1 });

export const OrganisationDocument = mongoose.model(
  "OrganisationDocument",
  organisationDocumentSchema
);
export default OrganisationDocument;
