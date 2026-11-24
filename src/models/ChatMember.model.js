import mongoose from "mongoose";

const chatMemberSchema = new mongoose.Schema(
  {
    room_id: { type: String, required: true, index: true },
    organisation_id: { type: String, required: true, index: true },
    grade_id: { type: String, default: "" },
    user_id: { type: String, required: true, index: true },
    user_role: { type: String, required: true },
    user_name: { type: String, default: "" },
    is_active: { type: Boolean, default: true, index: true },
    joined_at: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    collection: "chat_members",
  }
);

chatMemberSchema.index({ room_id: 1, user_id: 1 }, { unique: true });
chatMemberSchema.index({ organisation_id: 1, user_id: 1, is_active: 1 });

export const ChatMember = mongoose.model("ChatMember", chatMemberSchema);
export default ChatMember;
