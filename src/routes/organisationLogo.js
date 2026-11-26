import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import { memoryUpload } from "../middlewares/multer.middleware.js";
import {
  addLogo,
  updateLogo,
  getLogo,
  deleteLogo,
} from "../controllers/organisationLogo.js";

const router = Router();

router.route("/add-logo")
  .post(authenticateOrganisationActor, memoryUpload.single("logo_image"), addLogo);

router.route("/update-logo")
  .put(authenticateOrganisationActor, memoryUpload.single("logo_image"), updateLogo);

router.route("/get-logo")
  .get(authenticateOrganisationActor, getLogo);

router.route("/delete-logo")
  .delete(authenticateOrganisationActor, deleteLogo);

export default router;
