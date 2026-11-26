import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import {
  createTestFromDataSource,
  listTests,
  getTest,
  deleteTest,
} from "../controllers/organisationTest.js";

const router = Router();

router.route("")
  .get(authenticateOrganisationActor, listTests);

router.route("/generate")
  .post(authenticateOrganisationActor, createTestFromDataSource);

router.route("/:test_id")
  .get(authenticateOrganisationActor, getTest)
  .delete(authenticateOrganisationActor, deleteTest);

export default router;
