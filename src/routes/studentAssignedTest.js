import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import {
  getStudentAssignedTests,
  getStudentAssignedTestDetails,
  getStudentStudySummary,
} from "../controllers/studentAssignedTest.js";

const router = Router();

router.route("").get(authenticateStudent, getStudentAssignedTests);
router.route("/:assigned_test_id").get(authenticateStudent, getStudentAssignedTestDetails);
router.route("/:assigned_test_id/study-summary").get(authenticateStudent, getStudentStudySummary);

export default router;
