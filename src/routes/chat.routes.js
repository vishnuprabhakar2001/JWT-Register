import { Router } from "express";
import { authenticateChatUser } from "../middlewares/auth.middleware.js";
import {
  listUserChatRoomsController,
  directChatRoomController,
  getChatMembersController,
  getRoomMessagesController,
  sendRoomMessageController,
  unsendRoomMessageController,
  deleteMessageForMeController,
  clearRoomMessagesController,
  markRoomAsReadController,
  getUnreadChatCountController,
  getChatNotificationsController,
  markAllChatNotificationsReadController,
} from "../controllers/chat.controller.js";

const router = Router();

router.route("/rooms").get(authenticateChatUser, listUserChatRoomsController);
router.route("/direct").post(authenticateChatUser, directChatRoomController);
router.route("/rooms/direct").post(authenticateChatUser, directChatRoomController);
router.route("/members").get(authenticateChatUser, getChatMembersController);
router.route("/rooms/:room_id/messages")
  .get(authenticateChatUser, getRoomMessagesController)
  .post(authenticateChatUser, sendRoomMessageController)
  .delete(authenticateChatUser, clearRoomMessagesController);

router.route("/rooms/:room_id/messages/:message_id")
  .delete(authenticateChatUser, unsendRoomMessageController);

router.route("/rooms/:room_id/messages/:message_id/for-me")
  .post(authenticateChatUser, deleteMessageForMeController);

router.route("/rooms/:room_id/read")
  .post(authenticateChatUser, markRoomAsReadController);

router.route("/unread-count")
  .get(authenticateChatUser, getUnreadChatCountController);

router.route("/notifications")
  .get(authenticateChatUser, getChatNotificationsController);

router.route("/notifications/read-all")
  .post(authenticateChatUser, markAllChatNotificationsReadController);

export default router;
