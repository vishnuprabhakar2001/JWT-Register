import mongoose from "mongoose";

const documentChatMessageSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true, index: true },
    document_file_id: { type: String, required: true, index: true },
    organisation_admin_id: { type: String, required: true, index: true },
    role: { type: String, required: true, enum: ["user", "assistant"] },
    content: { type: String, default: "" },
    status: { type: String, default: "completed" },
    sources: { type: [mongoose.Schema.Types.Mixed], default: [] },
    error_code: { type: String, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "document_chat_messages",
  }
);

documentChatMessageSchema.index({ session_id: 1, created_at: 1 });
documentChatMessageSchema.index({ organisation_admin_id: 1, document_file_id: 1, created_at: 1 });

export const DocumentChatMessage = mongoose.model(
  "DocumentChatMessage",
  documentChatMessageSchema
);
export default DocumentChatMessage;
