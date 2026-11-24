import { Router } from "express";
import { authenticateChatUser } from "../middlewares/auth.middleware.js";
import {
  getLiveTestsOverviewController,
  getIndividualLeaderboardController,
} from "../controllers/leaderboard.controller.js";

const router = Router();

router.route("/live-tests").get(authenticateChatUser, getLiveTestsOverviewController);
router.route("/:assigned_test_id").get(authenticateChatUser, getIndividualLeaderboardController);

export default router;
