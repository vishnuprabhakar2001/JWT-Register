import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import {
  createTestFromDataSourceController,
  listTestsController,
  getTestController,
  deleteTestController,
} from "../controllers/organisationTest.controller.js";

const router = Router();

router.route("")
  .get(authenticateOrganisationActor, listTestsController);

router.route("/generate")
  .post(authenticateOrganisationActor, createTestFromDataSourceController);

router.route("/:test_id")
  .get(authenticateOrganisationActor, getTestController)
  .delete(authenticateOrganisationActor, deleteTestController);

export default router;
