import { Router } from "express";
import { authenticateChatUser } from "../middlewares/auth.middleware.js";
import {
  listUserChatRooms,
  directChatRoom,
  getChatMembers,
  getRoomMessages,
  sendRoomMessage,
  unsendRoomMessage,
  deleteMessageForMe,
  clearRoomMessages,
  markRoomAsRead,
  getUnreadChatCount,
  getChatNotifications,
  markAllChatNotificationsRead,
  editRoomMessage,
  deleteRoomForUser,
  searchRoomMentions,
} from "../controllers/chat.js";

const router = Router();

// 1. List Accessible Rooms & Direct Chat
router.route("/rooms").get(authenticateChatUser, listUserChatRooms);
router.route("/direct").post(authenticateChatUser, directChatRoom);
router.route("/rooms/direct").post(authenticateChatUser, directChatRoom);

// 2. View Members
router.route("/members").get(authenticateChatUser, getChatMembers);

// 3. Message History & Search Mentions & Send Message
router.route("/rooms/:room_id/mentions")
  .get(authenticateChatUser, searchRoomMentions);

router.route("/rooms/:room_id/messages")
  .get(authenticateChatUser, getRoomMessages)
  .post(authenticateChatUser, sendRoomMessage);

// 4. Edit Message
router.route("/rooms/:room_id/messages/:message_id")
  .patch(authenticateChatUser, editRoomMessage);

// 5. Unsend Message for Everyone
router.route("/rooms/:room_id/messages/:message_id/unsend")
  .delete(authenticateChatUser, unsendRoomMessage);

// 6. Delete Message for Me
router.route("/rooms/:room_id/messages/:message_id/delete-for-me")
  .delete(authenticateChatUser, deleteMessageForMe);

// 7. Clear & Delete Chat
router.route("/rooms/:room_id/clear")
  .post(authenticateChatUser, clearRoomMessages);

router.route("/rooms/:room_id/delete")
  .post(authenticateChatUser, deleteRoomForUser);

router.route("/rooms/:room_id/for-me")
  .delete(authenticateChatUser, deleteRoomForUser);

// 8. Read Status & Notifications
router.route("/rooms/:room_id/read")
  .post(authenticateChatUser, markRoomAsRead);

router.route("/unread-count")
  .get(authenticateChatUser, getUnreadChatCount);

router.route("/notifications")
  .get(authenticateChatUser, getChatNotifications);

router.route("/notifications/mark-all-read")
  .post(authenticateChatUser, markAllChatNotificationsRead);

export default router;
