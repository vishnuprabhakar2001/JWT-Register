import mongoose from "mongoose";

const documentChatSessionSchema = new mongoose.Schema(
  {
    document_file_id: { type: String, required: true, index: true },
    organisation_admin_id: { type: String, required: true, index: true },
    created_by_id: { type: String, required: true, index: true },
    created_by_role: { type: String, required: true },
    title: { type: String, default: "Document conversation" },
    status: { type: String, default: "active" },
    last_message_at: { type: Date, default: null },
    generation_message_id: { type: String, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "document_chat_sessions",
  }
);

documentChatSessionSchema.index({
  created_by_id: 1,
  document_file_id: 1,
  updated_at: -1,
});

documentChatSessionSchema.index({
  organisation_admin_id: 1,
  document_file_id: 1,
  updated_at: -1,
});

export const DocumentChatSession = mongoose.model(
  "DocumentChatSession",
  documentChatSessionSchema
);
export default DocumentChatSession;
