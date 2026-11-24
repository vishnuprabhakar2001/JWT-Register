import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    test_title: { type: String, required: true },
    file_id: { type: String, required: true, index: true },
    file_name: { type: String, default: "" },
    grade_id: { type: String, required: true, index: true },
    grade: { type: String, default: "" },
    section: { type: String, default: "" },
    subject_id: { type: String, required: true, index: true },
    subject_name: { type: String, default: "" },
    num_questions: { type: Number, required: true },
    question_types: { type: [String], default: [] },
    difficulty_levels: { type: [String], default: [] },
    language: { type: String, default: "English" },
    duration: { type: Number, default: 30 },
    total_marks: { type: Number, default: 0 },
    questions: { type: mongoose.Schema.Types.Mixed, default: {} },
    organisation_admin_id: { type: String, required: true, index: true },
    organisation_id: { type: String, required: true, index: true },
    created_by: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "tests",
  }
);

testSchema.index({ organisation_admin_id: 1, created_at: -1 });

export const Test = mongoose.model("Test", testSchema);
export default Test;
