import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    grade: { type: String, required: true },
    section: { type: String, default: null },
    organisation_admin_id: { type: String, index: true },
    organisation_id: { type: String, index: true },
    created_by: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "grades",
  }
);

export const Grade = mongoose.model("Grade", gradeSchema);
export default Grade;
