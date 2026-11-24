import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import { getOrganisationDashboardController } from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/organisation-dashboard")
  .post(authenticateOrganisationActor, getOrganisationDashboardController);

export default router;
