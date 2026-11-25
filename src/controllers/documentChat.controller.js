import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { OrganisationDocument } from "../models/OrganisationDocument.model.js";
import { DocumentChatSession } from "../models/DocumentChatSession.model.js";
import { DocumentChatMessage } from "../models/DocumentChatMessage.model.js";

export const getChatDocuments = async (currentAdmin) => {
  const adminId = String(currentAdmin._id);
  const docs = await OrganisationDocument.find({
    organisation_admin_id: adminId,
  }).sort({ created_at: -1 });

  return {
    success: true,
    message: "Documents available for chat fetched successfully.",
    data: docs.map((d) => ({
      file_id: d.file_id,
      document_name: d.document_name,
      grade: d.grade,
      subject_name: d.subject_name,
      file_type: d.file_type,
      chunks_count: d.chunks?.length || 0,
      created_at: d.created_at,
    })),
  };
};

export const createChatSession = async (documentFileId, title, currentAdmin) => {
  const adminId = String(currentAdmin._id);
  const doc = await OrganisationDocument.findOne({
    file_id: documentFileId,
    organisation_admin_id: adminId,
  });
  if (!doc) {
    throw new ApiError(404, "Document not found.");
  }

  const session = await DocumentChatSession.create({
    document_file_id: documentFileId,
    organisation_admin_id: adminId,
    created_by_id: adminId,
    created_by_role: currentAdmin.actor_role || "organisation_admin",
    title: title || `Conversation with ${doc.document_name}`,
    status: "active",
  });

  return {
    success: true,
    message: "Chat session created successfully.",
    data: {
      session_id: String(session._id),
      document_file_id: session.document_file_id,
      title: session.title,
      created_at: session.created_at,
    },
  };
};

export const getChatSessions = async (currentAdmin) => {
  const adminId = String(currentAdmin._id);
  const sessions = await DocumentChatSession.find({
    organisation_admin_id: adminId,
  }).sort({ updated_at: -1 });

  return {
    success: true,
    message: "Chat sessions fetched successfully.",
    data: sessions.map((s) => ({
      session_id: String(s._id),
      document_file_id: s.document_file_id,
      title: s.title,
      status: s.status,
      created_at: s.created_at,
      updated_at: s.updated_at,
    })),
  };
};

export const getChatMessagesBySessionId = async (sessionId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(400, "Invalid Session ID.");
  }
  const adminId = String(currentAdmin._id);
  const session = await DocumentChatSession.findOne({
    _id: sessionId,
    organisation_admin_id: adminId,
  });
  if (!session) {
    throw new ApiError(404, "Chat session not found.");
  }

  const messages = await DocumentChatMessage.find({
    session_id: sessionId,
  }).sort({ created_at: 1 });

  return {
    success: true,
    message: "Messages fetched successfully.",
    data: messages.map((m) => ({
      message_id: String(m._id),
      role: m.role,
      content: m.content,
      sources: m.sources,
      created_at: m.created_at,
    })),
  };
};

export const sendDocumentChatMessage = async (sessionId, userMessage, currentAdmin, res) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(400, "Invalid Session ID.");
  }
  const adminId = String(currentAdmin._id);
  const session = await DocumentChatSession.findOne({
    _id: sessionId,
    organisation_admin_id: adminId,
  });
  if (!session) {
    throw new ApiError(404, "Chat session not found.");
  }

  const doc = await OrganisationDocument.findOne({ file_id: session.document_file_id });
  const docName = doc?.document_name || "Document";
  const chunks = doc?.chunks || [];

  // Find relevant excerpt from chunks
  let relevantExcerpt = chunks.length > 0 ? chunks[0] : "Document context reference.";
  for (const c of chunks) {
    if (String(c).toLowerCase().includes(userMessage.toLowerCase().slice(0, 10))) {
      relevantExcerpt = c;
      break;
    }
  }

  // 1. Save user message
  await DocumentChatMessage.create({
    session_id: sessionId,
    document_file_id: session.document_file_id,
    organisation_admin_id: adminId,
    role: "user",
    content: userMessage,
    status: "completed",
  });

  // 2. Formulate assistant response
  const assistantResponse = `Based on the source document "${docName}", here is what is mentioned:\n\n${relevantExcerpt}\n\nThis addresses your inquiry: "${userMessage}".`;

  // 3. Save assistant message
  const assistantMsg = await DocumentChatMessage.create({
    session_id: sessionId,
    document_file_id: session.document_file_id,
    organisation_admin_id: adminId,
    role: "assistant",
    content: assistantResponse,
    status: "completed",
    sources: [
      {
        file_id: session.document_file_id,
        document_name: docName,
        score: 0.88,
        excerpt: relevantExcerpt.slice(0, 200),
      },
    ],
  });

  session.last_message_at = new Date();
  await session.save();

  // Stream response via SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`event: message\ndata: ${JSON.stringify({ type: "start", session_id: sessionId })}\n\n`);
  res.write(
    `event: message\ndata: ${JSON.stringify({
      type: "delta",
      content: assistantResponse,
    })}\n\n`
  );
  res.write(
    `event: message\ndata: ${JSON.stringify({
      type: "done",
      message_id: String(assistantMsg._id),
      sources: assistantMsg.sources,
    })}\n\n`
  );
  res.end();
};

export const getChatDocumentsController = async (req, res) => {
  const result = await getChatDocuments(req.current_admin);
  return res.status(200).json(result);
};

export const createChatSessionController = async (req, res) => {
  const result = await createChatSession(
    req.body.document_file_id,
    req.body.title,
    req.current_admin
  );
  return res.status(200).json(result);
};

export const getChatSessionsController = async (req, res) => {
  const result = await getChatSessions(req.current_admin);
  return res.status(200).json(result);
};

export const getChatMessagesBySessionIdController = async (req, res) => {
  const result = await getChatMessagesBySessionId(
    req.params.session_id,
    req.current_admin
  );
  return res.status(200).json(result);
};

export const sendDocumentChatMessageController = async (req, res) => {
  await sendDocumentChatMessage(
    req.params.session_id,
    req.body.message,
    req.current_admin,
    res
  );
};
