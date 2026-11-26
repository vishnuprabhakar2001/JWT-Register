import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import {
  getChatDocuments,
  createChatSession,
  getChatSessions,
  getChatMessagesBySessionId,
  sendDocumentChatMessage,
} from "../controllers/documentChat.js";

const router = Router();

router.route("/getChatdocument").get(authenticateOrganisationActor, getChatDocuments);
router.route("/createChatSessions").post(authenticateOrganisationActor, createChatSession);
router.route("/getChatSessions").get(authenticateOrganisationActor, getChatSessions);
router.route("/getChatMessagesbySessionId/:session_id").get(authenticateOrganisationActor, getChatMessagesBySessionId);
router.route("/createChatMessages/:session_id").post(authenticateOrganisationActor, sendDocumentChatMessage);

export default router;
