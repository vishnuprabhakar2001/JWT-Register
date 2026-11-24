import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import { memoryUpload } from "../middlewares/multer.middleware.js";
import {
  addReelController,
  getAllReelsController,
  updateReelCaptionController,
  deleteReelController,
} from "../controllers/reel.controller.js";

const router = Router();

router.route("/add_reels")
  .post(authenticateOrganisationActor, memoryUpload.single("video_file"), addReelController);

router.route("/get_all_reels")
  .get(authenticateOrganisationActor, getAllReelsController);

router.route("/update_reel_caption/:reel_id")
  .put(authenticateOrganisationActor, updateReelCaptionController);

router.route("/delete_reel/:reel_id")
  .delete(authenticateOrganisationActor, deleteReelController);

export default router;
