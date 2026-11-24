import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    organisation_id: { type: String, required: true, index: true },
    grade_id: { type: String, default: "", index: true },
    room_type: { type: String, default: "grade_group" }, // 'grade_group' | 'direct'
    room_name: { type: String, required: true },
    direct_pair_key: { type: String, default: null },
    created_by: { type: String, default: "" },
    member_count: { type: Number, default: 0 },
    last_message: { type: String, default: "" },
    last_message_at: { type: Date, default: null },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "chat_rooms",
  }
);

chatRoomSchema.index(
  { organisation_id: 1, grade_id: 1, room_type: 1 },
  { unique: true, partialFilterExpression: { room_type: "grade_group" } }
);

chatRoomSchema.index(
  { organisation_id: 1, direct_pair_key: 1 },
  { unique: true, partialFilterExpression: { room_type: "direct" } }
);

export const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;
