import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import { getStudentColorGradeController } from "../controllers/organisationColorGrade.controller.js";

const router = Router();

router.route("").get(authenticateStudent, getStudentColorGradeController);

export default router;
