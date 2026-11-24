import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import {
  createColorGradeController,
  updateColorGradeController,
  deleteColorGradeController,
  getColorGradeController,
} from "../controllers/organisationColorGrade.controller.js";

const router = Router();

router.route("/create-organisation-color-grade")
  .post(authenticateOrganisationActor, createColorGradeController);

router.route("/update-organisation-color-grade")
  .put(authenticateOrganisationActor, updateColorGradeController);

router.route("/delete-organisation-color-grade")
  .delete(authenticateOrganisationActor, deleteColorGradeController);

router.route("/get-organisation-color-grade")
  .get(authenticateOrganisationActor, getColorGradeController);

export default router;
