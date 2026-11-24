import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import {
  getUnreadNotificationCountController,
  markAllNotificationsReadController,
  listNotificationsController,
  markNotificationReadController,
} from "../controllers/notification.controller.js";

const router = Router();

router.route("")
  .get(authenticateStudent, listNotificationsController);

router.route("/unread-count")
  .get(authenticateStudent, getUnreadNotificationCountController);

router.route("/read-all")
  .patch(authenticateStudent, markAllNotificationsReadController);

router.route("/:notification_id/read")
  .patch(authenticateStudent, markNotificationReadController);

export default router;
