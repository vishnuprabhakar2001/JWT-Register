import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import {
  startStudentTestController,
  startStudentRetestController,
  submitStudentTestController,
  getStudentTestHistoryController,
} from "../controllers/studentTestAttempt.controller.js";
import { getSubjectAttemptResultsController } from "../controllers/studentSubjectResult.controller.js";

const router = Router();

router.route("/tests/:assigned_test_id/start").post(authenticateStudent, startStudentTestController);
router.route("/tests/:assigned_test_id/retests").post(authenticateStudent, startStudentRetestController);
router.route("/test-attempts/:attempt_id/submit").post(authenticateStudent, submitStudentTestController);
router.route("/test-history").get(authenticateStudent, getStudentTestHistoryController);
router.route("/test-attempts/:subject_id/result").get(authenticateStudent, getSubjectAttemptResultsController);

export default router;
