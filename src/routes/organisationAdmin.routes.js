import { Router } from "express";
import {
  loginOrganisationUserController,
  refreshOrganisationSessionController,
} from "../controllers/organisationAdmin.controller.js";

const router = Router();

router.route("/login").post(loginOrganisationUserController);
router.route("/refresh-access-token").post(refreshOrganisationSessionController);

export default router;
