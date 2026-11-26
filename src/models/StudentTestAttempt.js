import mongoose from "mongoose";

const studentTestAttemptSchema = new mongoose.Schema(
  {
    assigned_test_id: { type: String, required: true, index: true },
    test_id: { type: String, required: true, index: true },
    student_id: { type: String, required: true, index: true },
    student_name: { type: String, default: "" },
    student_email: { type: String, default: "" },
    attempt_number: { type: Number, required: true },
    attempt_type: { type: String, default: "test", index: true },
    status: { type: String, default: "in_progress", index: true },
    started_at: { type: Date, required: true },
    submitted_at: { type: Date, default: null, index: -1 },
    deadline_at: { type: Date, default: null, index: true },
    time_taken_seconds: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    total_marks: { type: Number, default: 0 },
    total_questions: { type: Number, default: 0 },
    correct_count: { type: Number, default: 0 },
    incorrect_count: { type: Number, default: 0 },
    unanswered_count: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    questions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    results: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "student_test_attempts",
  }
);

studentTestAttemptSchema.index(
  { assigned_test_id: 1, student_id: 1, attempt_number: 1 },
  { unique: true }
);

studentTestAttemptSchema.index({ student_id: 1, submitted_at: -1 });
studentTestAttemptSchema.index({ status: 1, deadline_at: 1 });

export const StudentTestAttempt = mongoose.model(
  "StudentTestAttempt",
  studentTestAttemptSchema
);
export default StudentTestAttempt;
