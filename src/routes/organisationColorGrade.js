import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import {
  createColorGrade,
  updateColorGrade,
  deleteColorGrade,
  getColorGrade,
} from "../controllers/organisationColorGrade.js";

const router = Router();

router.route("/create-organisation-color-grade")
  .post(authenticateOrganisationActor, createColorGrade);

router.route("/update-organisation-color-grade")
  .put(authenticateOrganisationActor, updateColorGrade);

router.route("/delete-organisation-color-grade")
  .delete(authenticateOrganisationActor, deleteColorGrade);

router.route("/get-organisation-color-grade")
  .get(authenticateOrganisationActor, getColorGrade);

export default router;
