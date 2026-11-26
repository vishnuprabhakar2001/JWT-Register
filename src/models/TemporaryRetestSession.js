import mongoose from "mongoose";

const temporaryRetestSessionSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true, index: true },
    assigned_test_id: { type: String, required: true, index: true },
    attempt_id: { type: String, required: true },
    expires_at: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "temporary_retest_sessions",
  }
);

export const TemporaryRetestSession = mongoose.model(
  "TemporaryRetestSession",
  temporaryRetestSessionSchema
);
export default TemporaryRetestSession;
