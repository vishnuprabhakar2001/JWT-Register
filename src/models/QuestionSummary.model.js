import mongoose from "mongoose";

const questionSummarySchema = new mongoose.Schema(
  {
    organisation_admin_id: { type: String, required: true, index: true },
    organisation_id: { type: String, index: true },
    file_id: { type: String, required: true, index: true },
    summary: { type: String, default: "" },
    key_points: { type: [String], default: [] },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "question_summaries",
  }
);

questionSummarySchema.index({
  organisation_admin_id: 1,
  file_id: 1,
});

export const QuestionSummary = mongoose.model(
  "QuestionSummary",
  questionSummarySchema
);
export default QuestionSummary;
