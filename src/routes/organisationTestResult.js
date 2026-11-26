import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import {
  getAllTestResults,
  getAssignedTestResult,
} from "../controllers/organisationTestResult.js";

const router = Router();

router.route("")
  .get(authenticateOrganisationActor, getAllTestResults);

router.route("/:assigned_test_id")
  .get(authenticateOrganisationActor, getAssignedTestResult);

export default router;
