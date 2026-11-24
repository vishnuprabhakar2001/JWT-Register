import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import { memoryUpload } from "../middlewares/multer.middleware.js";
import {
  addLogoController,
  updateLogoController,
  getLogoController,
  deleteLogoController,
} from "../controllers/organisationLogo.controller.js";

const router = Router();

router.route("/add-logo")
  .post(authenticateOrganisationActor, memoryUpload.single("logo_image"), addLogoController);

router.route("/update-logo")
  .put(authenticateOrganisationActor, memoryUpload.single("logo_image"), updateLogoController);

router.route("/get-logo")
  .get(authenticateOrganisationActor, getLogoController);

router.route("/delete-logo")
  .delete(authenticateOrganisationActor, deleteLogoController);

export default router;
