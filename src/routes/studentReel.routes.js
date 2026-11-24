import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import {
  getStudentReelsController,
  saveReelByStudentController,
  getStudentSavedReelsController,
} from "../controllers/reel.controller.js";

const router = Router();

router.route("/get_all_reels").get(authenticateStudent, getStudentReelsController);
router.route("/save_reel_by_reel_id/:reel_id").post(authenticateStudent, saveReelByStudentController);
router.route("/get_all_saved_reels_by_student").get(authenticateStudent, getStudentSavedReelsController);

export default router;
