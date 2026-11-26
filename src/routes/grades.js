import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import {
  createGrade,
  updateGrade,
  getGradeById,
  getAllGrades,
  deleteGrade,
} from "../controllers/grade.js";

const router = Router();

router.route("")
  .post(authenticateOrganisationActor, createGrade)
  .get(authenticateOrganisationActor, getAllGrades);

router.route("/:grade_id")
  .get(authenticateOrganisationActor, getGradeById)
  .put(authenticateOrganisationActor, updateGrade)
  .delete(authenticateOrganisationActor, deleteGrade);

export default router;
