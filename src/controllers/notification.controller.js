import asyncHandler from "../middlewares/asyncHandler.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { Notification } from "../models/Notification.model.js";

export const getUnreadNotificationCount = async (student) => {
  const studentId = String(student._id);
  const orgId = String(student.organisation_id || "");

  const count = await Notification.countDocuments({
    recipient_student_id: studentId,
    organisation_id: orgId,
    is_read: false,
  });

  return {
    success: true,
    message: "Unread notifications count fetched.",
    data: {
      unread_count: count,
    },
  };
};

export const markAllNotificationsRead = async (student) => {
  const studentId = String(student._id);
  const orgId = String(student.organisation_id || "");

  await Notification.updateMany(
    { recipient_student_id: studentId, organisation_id: orgId, is_read: false },
    { $set: { is_read: true } }
  );

  return {
    success: true,
    message: "All notifications marked as read.",
  };
};

export const listNotifications = async (student) => {
  const studentId = String(student._id);
  const orgId = String(student.organisation_id || "");

  const list = await Notification.find({
    recipient_student_id: studentId,
    organisation_id: orgId,
  }).sort({ created_at: -1 }).limit(50);

  return {
    success: true,
    message: "Notifications fetched successfully.",
    data: list.map((n) => ({
      notification_id: String(n._id),
      title: n.title,
      body: n.body,
      type: n.type,
      is_read: n.is_read,
      data: n.data,
      created_at: n.created_at,
    })),
  };
};

export const markNotificationRead = async (notificationId, student) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid Notification ID.");
  }
  const studentId = String(student._id);

  const notif = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient_student_id: studentId },
    { $set: { is_read: true } },
    { new: true }
  );
  if (!notif) {
    throw new ApiError(404, "Notification not found.");
  }

  return {
    success: true,
    message: "Notification marked as read.",
    data: {
      notification_id: String(notif._id),
      is_read: notif.is_read,
    },
  };
};

export const getUnreadNotificationCountController = asyncHandler(async (req, res) => {
  const result = await getUnreadNotificationCount(req.current_student);
  return res.status(200).json(result);
});

export const markAllNotificationsReadController = asyncHandler(async (req, res) => {
  const result = await markAllNotificationsRead(req.current_student);
  return res.status(200).json(result);
});

export const listNotificationsController = asyncHandler(async (req, res) => {
  const result = await listNotifications(req.current_student);
  return res.status(200).json(result);
});

export const markNotificationReadController = asyncHandler(async (req, res) => {
  const result = await markNotificationRead(
    req.params.notification_id,
    req.current_student
  );
  return res.status(200).json(result);
});
