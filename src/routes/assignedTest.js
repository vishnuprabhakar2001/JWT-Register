import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import {
  assignTest,
  getAllAssignedTests,
  deleteAssignedTest,
} from "../controllers/assignedTest.js";

const router = Router();

router.route("")
  .post(authenticateOrganisationActor, assignTest)
  .get(authenticateOrganisationActor, getAllAssignedTests);

router.route("/:assigned_test_id")
  .delete(authenticateOrganisationActor, deleteAssignedTest);

export default router;
