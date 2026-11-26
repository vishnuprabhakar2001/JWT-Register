import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient_student_id: { type: String, required: true, index: true },
    organisation_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, default: "general" },
    is_read: { type: Boolean, default: false, index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    idempotency_key: { type: String, unique: true, sparse: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "notifications",
  }
);

notificationSchema.index({ recipient_student_id: 1, organisation_id: 1, created_at: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
