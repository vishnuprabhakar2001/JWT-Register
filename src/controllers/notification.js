import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Notification } from "../models/Notification.js";

export const getUnreadNotificationCount = async (req, res) => {
  const student = req.current_student;
  const studentId = String(student._id);
  const orgId = String(student.organisation_id || "");

  const count = await Notification.countDocuments({
    recipient_student_id: studentId,
    organisation_id: orgId,
    is_read: false,
  });

  return res.status(200).json(new ApiResponse("Unread notifications count fetched.", { unread_count: count }));
};

export const markAllNotificationsRead = async (req, res) => {
  const student = req.current_student;
  const studentId = String(student._id);
  const orgId = String(student.organisation_id || "");

  await Notification.updateMany(
    { recipient_student_id: studentId, organisation_id: orgId, is_read: false },
    { $set: { is_read: true } }
  );

  return res.status(200).json(new ApiResponse("All notifications marked as read."));
};

export const listNotifications = async (req, res) => {
  const student = req.current_student;
  const studentId = String(student._id);
  const orgId = String(student.organisation_id || "");

  const list = await Notification.find({
    recipient_student_id: studentId,
    organisation_id: orgId,
  }).sort({ created_at: -1 }).limit(50);

  const data = list.map((n) => ({
    notification_id: String(n._id),
    title: n.title,
    body: n.body,
    type: n.type,
    is_read: n.is_read,
    data: n.data,
    created_at: n.created_at,
  }));

  return res.status(200).json(new ApiResponse("Notifications fetched successfully.", data));
};

export const markNotificationRead = async (req, res) => {
  const { notification_id } = req.params;
  const student = req.current_student;

  if (!mongoose.Types.ObjectId.isValid(notification_id)) {
    throw new ApiError(400, "Invalid Notification ID.");
  }
  const studentId = String(student._id);

  const notif = await Notification.findOneAndUpdate(
    { _id: notification_id, recipient_student_id: studentId },
    { $set: { is_read: true } },
    { new: true }
  );
  if (!notif) {
    throw new ApiError(404, "Notification not found.");
  }

  const data = {
    notification_id: String(notif._id),
    is_read: notif.is_read,
  };

  return res.status(200).json(new ApiResponse("Notification marked as read.", data));
};
