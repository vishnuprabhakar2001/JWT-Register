import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { ChatRoom } from "../models/ChatRoom.model.js";
import { ChatMember } from "../models/ChatMember.model.js";
import { ChatMessage } from "../models/ChatMessage.model.js";
import { ChatMessageUserState } from "../models/ChatMessageUserState.model.js";
import { ChatNotification } from "../models/ChatNotification.model.js";
import { User } from "../models/user.model.js";

function makeDirectPairKey(u1, u2) {
  return [String(u1), String(u2)].sort().join("_");
}

export const listUserChatRooms = async (currentUser, includeInactive = false) => {
  const userId = currentUser.id;
  const orgId = currentUser.organisation_id;

  // 1. Grade group room (if student has grade_id)
  let rooms = [];
  if (currentUser.grade_id) {
    let gradeRoom = await ChatRoom.findOne({
      organisation_id: orgId,
      grade_id: currentUser.grade_id,
      room_type: "grade_group",
    });
    if (!gradeRoom) {
      gradeRoom = await ChatRoom.create({
        organisation_id: orgId,
        grade_id: currentUser.grade_id,
        room_type: "grade_group",
        room_name: `Grade ${currentUser.grade || ""} Discussion`,
        member_count: 1,
      });
    }
    rooms.push(gradeRoom);
  }

  // 2. Direct rooms where user is a participant
  const directRooms = await ChatRoom.find({
    organisation_id: orgId,
    room_type: "direct",
    direct_pair_key: { $regex: userId },
    ...(includeInactive ? {} : { is_active: true }),
  });
  rooms.push(...directRooms);

  return {
    success: true,
    message: "Chat rooms fetched successfully.",
    data: rooms.map((r) => ({
      room_id: String(r._id),
      organisation_id: r.organisation_id,
      grade_id: r.grade_id,
      room_type: r.room_type,
      room_name: r.room_name,
      last_message: r.last_message,
      last_message_at: r.last_message_at,
      member_count: r.member_count,
    })),
  };
};

export const getOrCreateDirectChatRoom = async (currentUser, targetUserId) => {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new ApiError(400, "Invalid Target User ID.");
  }
  const userId = currentUser.id;
  const orgId = currentUser.organisation_id;

  const target = await User.findById(targetUserId);
  if (!target) {
    throw new ApiError(404, "Target user not found.");
  }

  const directPairKey = makeDirectPairKey(userId, targetUserId);

  let room = await ChatRoom.findOne({
    organisation_id: orgId,
    room_type: "direct",
    direct_pair_key: directPairKey,
  });

  if (!room) {
    room = await ChatRoom.create({
      organisation_id: orgId,
      room_type: "direct",
      room_name: target.name || "Direct Chat",
      direct_pair_key: directPairKey,
      created_by: userId,
      member_count: 2,
    });
  }

  return {
    success: true,
    message: "Direct chat room ready.",
    data: {
      room_id: String(room._id),
      room_name: room.room_name,
      room_type: room.room_type,
      target_user: {
        id: String(target._id),
        name: target.name,
        role: target.role,
      },
    },
  };
};

export const getChatMembers = async (currentUser, search = "") => {
  const orgId = currentUser.organisation_id;
  const query = {
    organisation_id: orgId,
    _id: { $ne: currentUser.id },
    status: "active",
  };
  if (currentUser.grade_id) {
    query.grade_id = currentUser.grade_id;
  }
  if (search && search.trim()) {
    query.name = { $regex: search.trim(), $options: "i" };
  }

  const users = await User.find(query).limit(50);

  return {
    success: true,
    message: "Chat members fetched successfully.",
    data: users.map((u) => ({
      user_id: String(u._id),
      name: u.name,
      role: u.role,
      email: u.email,
      phone: u.phone,
    })),
  };
};

export const getRoomMessages = async (roomId, currentUser, limit = 50) => {
  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new ApiError(400, "Invalid Room ID.");
  }
  const userId = currentUser.id;

  // Find messages deleted-for-me
  const deletedStates = await ChatMessageUserState.find({
    room_id: roomId,
    user_id: userId,
    is_deleted_for_me: true,
  });
  const deletedIds = new Set(deletedStates.map((s) => s.message_id));

  const messages = await ChatMessage.find({
    room_id: roomId,
  })
    .sort({ created_at: -1 })
    .limit(limit);

  const filtered = messages
    .filter((m) => !deletedIds.has(String(m._id)))
    .reverse();

  return {
    success: true,
    message: "Messages fetched successfully.",
    data: filtered.map((m) => ({
      message_id: String(m._id),
      room_id: m.room_id,
      sender_id: m.sender_id,
      sender_name: m.sender_name,
      sender_role: m.sender_role,
      message_text: m.is_unsent ? "This message was unsent." : m.message_text,
      is_unsent: m.is_unsent,
      is_edited: m.is_edited,
      mentions: m.mentions,
      created_at: m.created_at,
    })),
  };
};

export const sendRoomMessage = async ({ roomId, currentUser, message_text, mentions = [] }) => {
  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new ApiError(400, "Invalid Room ID.");
  }
  if (!message_text || !message_text.trim()) {
    throw new ApiError(400, "message_text is required.");
  }

  const room = await ChatRoom.findById(roomId);
  if (!room) {
    throw new ApiError(404, "Chat room not found.");
  }

  const msg = await ChatMessage.create({
    room_id: roomId,
    sender_id: currentUser.id,
    sender_name: currentUser.name || "User",
    sender_role: currentUser.role || "student",
    message_text: message_text.trim(),
    mentions: mentions || [],
  });

  room.last_message = message_text.trim();
  room.last_message_at = new Date();
  await room.save();

  // Create notifications for mentions
  if (Array.isArray(mentions) && mentions.length > 0) {
    const notifs = mentions.map((targetId) => ({
      recipient_user_id: targetId,
      sender_user_id: currentUser.id,
      room_id: roomId,
      message_id: String(msg._id),
      notification_type: "mention",
      preview_text: message_text.trim().slice(0, 100),
    }));
    await ChatNotification.insertMany(notifs);
  }

  return {
    message_id: String(msg._id),
    room_id: roomId,
    sender_id: msg.sender_id,
    sender_name: msg.sender_name,
    sender_role: msg.sender_role,
    message_text: msg.message_text,
    mentions: msg.mentions,
    is_unsent: false,
    is_edited: false,
    created_at: msg.created_at,
  };
};

export const unsendRoomMessage = async (roomId, messageId, currentUser) => {
  const msg = await ChatMessage.findOne({ _id: messageId, room_id: roomId, sender_id: currentUser.id });
  if (!msg) {
    throw new ApiError(404, "Message not found or you are not the sender.");
  }

  msg.is_unsent = true;
  await msg.save();

  return {
    success: true,
    message: "Message unsent successfully.",
  };
};

export const deleteMessageForMe = async (roomId, messageId, currentUser) => {
  await ChatMessageUserState.findOneAndUpdate(
    { message_id: messageId, user_id: currentUser.id },
    { $set: { room_id: roomId, is_deleted_for_me: true } },
    { upsert: true }
  );

  return {
    success: true,
    message: "Message deleted for you.",
  };
};

export const clearRoomMessages = async (roomId, currentUser) => {
  const messages = await ChatMessage.find({ room_id: roomId }, { _id: 1 });
  const updates = messages.map((m) => ({
    updateOne: {
      filter: { message_id: String(m._id), user_id: currentUser.id },
      update: { $set: { room_id: roomId, is_deleted_for_me: true } },
      upsert: true,
    },
  }));

  if (updates.length > 0) {
    await ChatMessageUserState.bulkWrite(updates);
  }

  return {
    success: true,
    message: "Room messages cleared for you.",
  };
};

export const markRoomAsRead = async (roomId, currentUser) => {
  await ChatMessageUserState.updateMany(
    { room_id: roomId, user_id: currentUser.id, is_read: false },
    { $set: { is_read: true, read_at: new Date() } }
  );

  return {
    success: true,
    message: "Messages marked as read.",
  };
};

export const getUnreadChatCount = async (currentUser) => {
  const userId = currentUser.id;
  const count = await ChatNotification.countDocuments({
    recipient_user_id: userId,
    is_read: false,
  });

  return {
    success: true,
    message: "Unread count fetched.",
    data: {
      unread_count: count,
    },
  };
};

export const getChatNotifications = async (currentUser) => {
  const userId = currentUser.id;
  const list = await ChatNotification.find({ recipient_user_id: userId })
    .sort({ created_at: -1 })
    .limit(50);

  return {
    success: true,
    message: "Chat notifications fetched.",
    data: list.map((n) => ({
      id: String(n._id),
      room_id: n.room_id,
      sender_user_id: n.sender_user_id,
      notification_type: n.notification_type,
      preview_text: n.preview_text,
      is_read: n.is_read,
      created_at: n.created_at,
    })),
  };
};

export const markAllChatNotificationsRead = async (currentUser) => {
  const userId = currentUser.id;
  await ChatNotification.updateMany(
    { recipient_user_id: userId, is_read: false },
    { $set: { is_read: true } }
  );

  return {
    success: true,
    message: "All chat notifications marked as read.",
  };
};

export const editRoomMessage = async (roomId, messageId, newText, currentUser) => {
  const msg = await ChatMessage.findOne({ _id: messageId, room_id: roomId, sender_id: currentUser.id });
  if (!msg) {
    throw new ApiError(404, "Message not found or you are not the sender.");
  }
  const diffSec = (Date.now() - new Date(msg.created_at).getTime()) / 1000;
  if (diffSec > 120) {
    throw new ApiError(400, "Message can only be edited within 2 minutes of sending.");
  }
  msg.message_text = newText;
  msg.is_edited = true;
  await msg.save();
  return {
    success: true,
    message: "Message edited successfully.",
    data: msg,
  };
};

export const deleteRoomForUser = async (roomId, currentUser) => {
  return await clearRoomMessages(roomId, currentUser);
};

export const searchRoomMentions = async (roomId, currentUser, search = "") => {
  const members = await getChatMembers(currentUser, search);
  return {
    success: true,
    data: members.data || [],
  };
};

export const editRoomMessageController = async (req, res) => {
  const result = await editRoomMessage(
    req.params.room_id,
    req.params.message_id,
    req.body.message || req.body.message_text,
    req.current_user
  );
  return res.status(200).json(result);
};

export const deleteRoomForUserController = async (req, res) => {
  const result = await deleteRoomForUser(req.params.room_id, req.current_user);
  return res.status(200).json(result);
};

export const searchRoomMentionsController = async (req, res) => {
  const result = await searchRoomMentions(req.params.room_id, req.current_user, req.query.search);
  return res.status(200).json(result);
};

export const listUserChatRoomsController = async (req, res) => {
  const includeInactive = req.query.include_inactive === "true";
  const result = await listUserChatRooms(req.current_user, includeInactive);
  return res.status(200).json(result);
};

export const directChatRoomController = async (req, res) => {
  const result = await getOrCreateDirectChatRoom(
    req.current_user,
    req.body.target_user_id
  );
  return res.status(200).json(result);
};

export const getChatMembersController = async (req, res) => {
  const result = await getChatMembers(req.current_user, req.query.search);
  return res.status(200).json(result);
};

export const getRoomMessagesController = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const result = await getRoomMessages(
    req.params.room_id,
    req.current_user,
    limit,
    req.query.before
  );
  return res.status(200).json(result);
};

export const sendRoomMessageController = async (req, res) => {
  const result = await sendRoomMessage(
    req.params.room_id,
    req.current_user,
    req.body.message_text
  );
  return res.status(201).json(result);
};

export const unsendRoomMessageController = async (req, res) => {
  const result = await unsendRoomMessage(
    req.params.room_id,
    req.params.message_id,
    req.current_user
  );
  return res.status(200).json(result);
};

export const deleteMessageForMeController = async (req, res) => {
  const result = await deleteMessageForMe(
    req.params.room_id,
    req.params.message_id,
    req.current_user
  );
  return res.status(200).json(result);
};

export const clearRoomMessagesController = async (req, res) => {
  const result = await clearRoomMessages(req.params.room_id, req.current_user);
  return res.status(200).json(result);
};

export const markRoomAsReadController = async (req, res) => {
  const result = await markRoomAsRead(req.params.room_id, req.current_user);
  return res.status(200).json(result);
};

export const getUnreadChatCountController = async (req, res) => {
  const result = await getUnreadChatCount(req.current_user);
  return res.status(200).json(result);
};

export const getChatNotificationsController = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const result = await getChatNotifications(req.current_user, limit);
  return res.status(200).json(result);
};

export const markAllChatNotificationsReadController = async (req, res) => {
  const result = await markAllChatNotificationsRead(req.current_user);
  return res.status(200).json(result);
};
