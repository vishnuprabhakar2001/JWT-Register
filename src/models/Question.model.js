import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    organisation_admin_id: { type: String, required: true, index: true },
    organisation_id: { type: String, index: true },
    file_id: { type: String, required: true, index: true },
    question_type_key: { type: String, required: true },
    question_type: { type: String, required: true },
    difficulty_level: { type: String, required: true },
    language: { type: String, default: "English" },
    questions: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "questions",
  }
);

questionSchema.index({
  organisation_admin_id: 1,
  file_id: 1,
  question_type_key: 1,
  difficulty_level: 1,
});

export const Question = mongoose.model("Question", questionSchema);
export default Question;
