import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    subject_name: { type: String, required: true },
    grade: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    organisation_admin_id: { type: String, index: true },
    organisation_id: { type: String, index: true },
    created_by: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "subjects",
  }
);

export const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;
