import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import {
  verifyStudentOtpController,
  refreshStudentTokenController,
  logoutStudentController,
  updateStudentFcmTokenController,
} from "../controllers/studentAuth.controller.js";

const router = Router();

router.route("/verify-otp").post(verifyStudentOtpController);
router.route("/refresh-token").post(refreshStudentTokenController);
router.route("/logout").post(authenticateStudent, logoutStudentController);
router.route("/fcm-token").post(authenticateStudent, updateStudentFcmTokenController);

export default router;
