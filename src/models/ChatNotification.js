import mongoose from "mongoose";

const chatNotificationSchema = new mongoose.Schema(
  {
    recipient_user_id: { type: String, required: true, index: true },
    sender_user_id: { type: String, required: true },
    room_id: { type: String, required: true },
    message_id: { type: String, required: true },
    notification_type: { type: String, default: "mention" }, // 'mention' | 'direct_message'
    is_read: { type: Boolean, default: false, index: true },
    preview_text: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "chat_notifications",
  }
);

export const ChatNotification = mongoose.model(
  "ChatNotification",
  chatNotificationSchema
);
export default ChatNotification;
