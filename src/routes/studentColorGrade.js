import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import { getStudentColorGrade } from "../controllers/organisationColorGrade.js";

const router = Router();

router.route("/get-student-color_grade").get(authenticateStudent, getStudentColorGrade);

export default router;
