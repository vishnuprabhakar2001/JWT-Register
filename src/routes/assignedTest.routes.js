import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import {
  assignTestController,
  getAllAssignedTestsController,
  deleteAssignedTestController,
} from "../controllers/assignedTest.controller.js";

const router = Router();

router.route("")
  .post(authenticateOrganisationActor, assignTestController)
  .get(authenticateOrganisationActor, getAllAssignedTestsController);

router.route("/:assigned_test_id")
  .delete(authenticateOrganisationActor, deleteAssignedTestController);

export default router;
