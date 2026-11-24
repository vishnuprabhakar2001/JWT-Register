import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import { getStudentLogoController } from "../controllers/organisationLogo.controller.js";

const router = Router();

router.route("/get-student-logo").get(authenticateStudent, getStudentLogoController);

export default router;
