import mongoose from "mongoose";

const notificationOutboxSchema = new mongoose.Schema(
  {
    idempotency_key: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    delivery_status: { type: String, default: "pending", index: true },
    next_attempt_at: { type: Date, default: Date.now, index: true },
    attempts: { type: Number, default: 0 },
    error: { type: String, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "notification_outbox",
  }
);

export const NotificationOutbox = mongoose.model(
  "NotificationOutbox",
  notificationOutboxSchema
);
export default NotificationOutbox;
