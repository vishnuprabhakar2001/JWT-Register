import { Router } from "express";
import {
  loginOrganisationUser,
  refreshOrganisationSession,
} from "../controllers/organisationAdmin.js";

const router = Router();

router.route("/login").post(loginOrganisationUser);
router.route("/refresh-access-token").post(refreshOrganisationSession);

export default router;
