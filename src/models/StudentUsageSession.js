import mongoose from "mongoose";

const studentUsageSessionSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    organisation_id: {
      type: String,
      required: true,
      index: true,
    },
    auth_session_id: {
      type: String,
      required: true,
    },
    usage_session_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    connection_id: {
      type: String,
      default: null,
    },
    correlation_id: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    started_at: {
      type: Date,
      default: Date.now,
    },
    last_active_at: {
      type: Date,
      default: Date.now,
    },
    ended_at: {
      type: Date,
      default: null,
    },
    duration_seconds: {
      type: Number,
      default: 0,
    },
    end_reason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

studentUsageSessionSchema.index({ student_id: 1, organisation_id: 1, status: 1 });
studentUsageSessionSchema.index({ started_at: 1, ended_at: 1 });

export const StudentUsageSession = mongoose.model(
  "StudentUsageSession",
  studentUsageSessionSchema,
  "student_usage_sessions"
);

export default StudentUsageSession;
