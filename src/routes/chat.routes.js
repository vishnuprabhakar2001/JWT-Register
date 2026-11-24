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
  editRoomMessageController,
  deleteRoomForUserController,
  searchRoomMentionsController,
} from "../controllers/chat.controller.js";

const router = Router();

// 1. List Accessible Rooms & Direct Chat
router.route("/rooms").get(authenticateChatUser, listUserChatRoomsController);
router.route("/direct").post(authenticateChatUser, directChatRoomController);
router.route("/rooms/direct").post(authenticateChatUser, directChatRoomController);

// 2. View Members
router.route("/members").get(authenticateChatUser, getChatMembersController);

// 3. Message History & Search Mentions & Send Message
router.route("/rooms/:room_id/mentions")
  .get(authenticateChatUser, searchRoomMentionsController);

router.route("/rooms/:room_id/messages")
  .get(authenticateChatUser, getRoomMessagesController)
  .post(authenticateChatUser, sendRoomMessageController);

// 4. Edit Message
router.route("/rooms/:room_id/messages/:message_id")
  .patch(authenticateChatUser, editRoomMessageController);

// 5. Unsend Message for Everyone
router.route("/rooms/:room_id/messages/:message_id/unsend")
  .delete(authenticateChatUser, unsendRoomMessageController);

// 6. Delete Message for Me
router.route("/rooms/:room_id/messages/:message_id/delete-for-me")
  .delete(authenticateChatUser, deleteMessageForMeController);

// 7. Clear & Delete Chat
router.route("/rooms/:room_id/clear")
  .post(authenticateChatUser, clearRoomMessagesController);

router.route("/rooms/:room_id/delete")
  .post(authenticateChatUser, deleteRoomForUserController);

router.route("/rooms/:room_id/for-me")
  .delete(authenticateChatUser, deleteRoomForUserController);

// 8. Read Status & Notifications
router.route("/rooms/:room_id/read")
  .post(authenticateChatUser, markRoomAsReadController);

router.route("/unread-count")
  .get(authenticateChatUser, getUnreadChatCountController);

router.route("/notifications")
  .get(authenticateChatUser, getChatNotificationsController);

router.route("/notifications/mark-all-read")
  .post(authenticateChatUser, markAllChatNotificationsReadController);

export default router;
