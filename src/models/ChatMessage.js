import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    room_id: { type: String, required: true, index: true },
    sender_id: { type: String, required: true, index: true },
    sender_name: { type: String, required: true },
    sender_role: { type: String, required: true },
    message_text: { type: String, default: "" },
    message_type: { type: String, default: "text" },
    mentions: { type: [String], default: [] },
    is_unsent: { type: Boolean, default: false },
    is_edited: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "chat_messages",
  }
);

chatMessageSchema.index({ room_id: 1, created_at: 1 });

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export default ChatMessage;
