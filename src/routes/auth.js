import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import {
  verifyStudentOtp,
  refreshStudentToken,
  logoutStudent,
  updateStudentFcmToken,
} from "../controllers/studentAuth.js";

const router = Router();

router.route("/verify-otp").post(verifyStudentOtp);
router.route("/refresh-token").post(refreshStudentToken);
router.route("/logout").post(authenticateStudent, logoutStudent);
router.route("/fcm-token").post(authenticateStudent, updateStudentFcmToken);

export default router;
