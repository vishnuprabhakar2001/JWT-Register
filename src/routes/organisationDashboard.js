import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import { getOrganisationDashboard } from "../controllers/dashboard.js";

const router = Router();

router.route("/organisation-dashboard")
  .post(authenticateOrganisationActor, getOrganisationDashboard);

export default router;
