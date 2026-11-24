import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import {
  getChatDocumentsController,
  createChatSessionController,
  getChatSessionsController,
  getChatMessagesBySessionIdController,
  sendDocumentChatMessageController,
} from "../controllers/documentChat.controller.js";

const router = Router();

router.route("/getChatdocument").get(authenticateOrganisationActor, getChatDocumentsController);
router.route("/createChatSessions").post(authenticateOrganisationActor, createChatSessionController);
router.route("/getChatSessions").get(authenticateOrganisationActor, getChatSessionsController);
router.route("/getChatMessagesbySessionId/:session_id").get(authenticateOrganisationActor, getChatMessagesBySessionIdController);
router.route("/createChatMessages/:session_id").post(authenticateOrganisationActor, sendDocumentChatMessageController);

export default router;
