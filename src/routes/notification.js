import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import {
  getUnreadNotificationCount,
  markAllNotificationsRead,
  listNotifications,
  markNotificationRead,
} from "../controllers/notification.js";

const router = Router();

router.route("")
  .get(authenticateStudent, listNotifications);

router.route("/unread-count")
  .get(authenticateStudent, getUnreadNotificationCount);

router.route("/read-all")
  .patch(authenticateStudent, markAllNotificationsRead);

router.route("/:notification_id/read")
  .patch(authenticateStudent, markNotificationRead);

export default router;
