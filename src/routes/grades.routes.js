import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import {
  createGradeController,
  updateGradeController,
  getGradeByIdController,
  getAllGradesController,
  deleteGradeController,
} from "../controllers/grade.controller.js";

const router = Router();

router.route("/create_grade").post(authenticateOrganisationActor, createGradeController);
router.route("/update_grade/:grade_id").put(authenticateOrganisationActor, updateGradeController);
router.route("/get_grade_by_id/:grade_id").get(authenticateOrganisationActor, getGradeByIdController);
router.route("/get_all_grade").get(authenticateOrganisationActor, getAllGradesController);
router.route("/delete_grade/:grade_id").delete(authenticateOrganisationActor, deleteGradeController);

export default router;
