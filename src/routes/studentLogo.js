import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import { getStudentLogo } from "../controllers/organisationLogo.js";

const router = Router();

router.route("/get-student-logo").get(authenticateStudent, getStudentLogo);

export default router;
