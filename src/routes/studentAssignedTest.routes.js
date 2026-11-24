import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import {
  getStudentAssignedTestsController,
  getStudentAssignedTestDetailsController,
  getStudentStudySummaryController,
} from "../controllers/studentAssignedTest.controller.js";

const router = Router();

router.route("").get(authenticateStudent, getStudentAssignedTestsController);
router.route("/:assigned_test_id").get(authenticateStudent, getStudentAssignedTestDetailsController);
router.route("/:assigned_test_id/study-summary").get(authenticateStudent, getStudentStudySummaryController);

export default router;
