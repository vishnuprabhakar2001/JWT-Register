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

// Standard REST endpoints
router.route("")
  .post(authenticateOrganisationActor, createGrade)
  .get(authenticateOrganisationActor, getAllGrades);

// Python RPC endpoints compatibility
router.route("/create_grade")
  .post(authenticateOrganisationActor, createGrade);

router.route("/get_all_grade")
  .get(authenticateOrganisationActor, getAllGrades);

router.route("/get_grade_by_id/:grade_id")
  .get(authenticateOrganisationActor, getGradeById);

router.route("/update_grade/:grade_id")
  .put(authenticateOrganisationActor, updateGrade);

router.route("/delete_grade/:grade_id")
  .delete(authenticateOrganisationActor, deleteGrade);

// REST id routes
router.route("/:grade_id")
  .get(authenticateOrganisationActor, getGradeById)
  .put(authenticateOrganisationActor, updateGrade)
  .delete(authenticateOrganisationActor, deleteGrade);

export default router;
