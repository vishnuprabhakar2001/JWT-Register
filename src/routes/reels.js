import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import { memoryUpload } from "../middlewares/multer.middleware.js";
import {
  addReel,
  getAllReels,
  updateReelCaption,
  deleteReel,
} from "../controllers/reel.js";

const router = Router();

router.route("/add_reels")
  .post(authenticateOrganisationActor, memoryUpload.single("video_file"), addReel);

router.route("/get_all_reels")
  .get(authenticateOrganisationActor, getAllReels);

router.route("/update_reel_caption/:reel_id")
  .put(authenticateOrganisationActor, updateReelCaption);

router.route("/delete_reel/:reel_id")
  .delete(authenticateOrganisationActor, deleteReel);

export default router;
