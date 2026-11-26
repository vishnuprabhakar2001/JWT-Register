import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import {
  getStudentReels,
  saveReelByStudent,
  getStudentSavedReels,
} from "../controllers/reel.js";

const router = Router();

router.route("/get_all_reels").get(authenticateStudent, getStudentReels);
router.route("/save_reel_by_reel_id/:reel_id").post(authenticateStudent, saveReelByStudent);
router.route("/get_all_saved_reels_by_student").get(authenticateStudent, getStudentSavedReels);

export default router;
