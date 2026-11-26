import mongoose from "mongoose";

const bulkCandidateUploadSchema = new mongoose.Schema(
  {
    organisation_admin_id: { type: String, required: true, index: true },
    organisation_id: { type: String, required: true, index: true },
    type: { type: String, default: "organisation" },
    file_id: { type: String, required: true, index: true },
    grade_id: { type: String, required: true, index: true },
    grade: { type: String, required: true },
    section: { type: String, default: "" },
    file_name: { type: String, required: true },
    stored_name: { type: String, required: true },
    file_path: { type: String, required: true },
    file_size: { type: Number, required: true },
    status: { type: String, default: "PROCESSING" },
    total_rows: { type: Number, default: 0 },
    imported_count: { type: Number, default: 0 },
    failed_count: { type: Number, default: 0 },
    errors: { type: [mongoose.Schema.Types.Mixed], default: [] },
    created_by: { type: String, default: "" },
    created_by_name: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "bulk_candidate_uploads",
    suppressReservedKeysWarning: true,
  }
);

bulkCandidateUploadSchema.index({
  organisation_admin_id: 1,
  organisation_id: 1,
  created_at: -1,
});

export const BulkCandidateUpload = mongoose.model(
  "BulkCandidateUpload",
  bulkCandidateUploadSchema
);
export default BulkCandidateUpload;
