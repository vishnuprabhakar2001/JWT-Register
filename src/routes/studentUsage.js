import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import { getStudentUsageSummary } from "../controllers/studentUsage.js";

const router = Router();

router.route("/summary").get(authenticateStudent, getStudentUsageSummary);

export default router;
