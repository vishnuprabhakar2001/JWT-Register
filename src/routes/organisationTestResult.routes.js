import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import {
  getAllTestResultsController,
  getAssignedTestResultController,
} from "../controllers/organisationTestResult.controller.js";

const router = Router();

router.route("")
  .get(authenticateOrganisationActor, getAllTestResultsController);

router.route("/:assigned_test_id")
  .get(authenticateOrganisationActor, getAssignedTestResultController);

export default router;
