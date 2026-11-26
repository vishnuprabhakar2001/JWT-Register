import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import {
  startStudentTest,
  startStudentRetest,
  submitStudentTest,
  getStudentTestHistory,
} from "../controllers/studentTestAttempt.js";
import { getSubjectAttemptResults } from "../controllers/studentSubjectResult.js";

const router = Router();

router.route("/tests/:assigned_test_id/start").post(authenticateStudent, startStudentTest);
router.route("/tests/:assigned_test_id/retests").post(authenticateStudent, startStudentRetest);
router.route("/test-attempts/:attempt_id/submit").post(authenticateStudent, submitStudentTest);
router.route("/test-history").get(authenticateStudent, getStudentTestHistory);
router.route("/test-attempts/:subject_id/result").get(authenticateStudent, getSubjectAttemptResults);

export default router;
