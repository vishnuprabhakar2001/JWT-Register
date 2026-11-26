import mongoose from "mongoose";

const chatMessageUserStateSchema = new mongoose.Schema(
  {
    message_id: { type: String, required: true, index: true },
    room_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    is_deleted_for_me: { type: Boolean, default: false, index: true },
    is_read: { type: Boolean, default: false, index: true },
    read_at: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "chat_message_user_states",
  }
);

chatMessageUserStateSchema.index(
  { message_id: 1, user_id: 1 },
  { unique: true }
);

chatMessageUserStateSchema.index({ room_id: 1, user_id: 1, is_deleted_for_me: 1 });

export const ChatMessageUserState = mongoose.model(
  "ChatMessageUserState",
  chatMessageUserStateSchema
);
export default ChatMessageUserState;
