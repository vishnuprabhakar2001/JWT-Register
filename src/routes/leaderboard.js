import { Router } from "express";
import { authenticateChatUser } from "../middlewares/auth.middleware.js";
import {
  getLiveTestsOverview,
  getIndividualLeaderboard,
} from "../controllers/leaderboard.js";

const router = Router();

router.route("/live-tests").get(authenticateChatUser, getLiveTestsOverview);
router.route("/:assigned_test_id").get(authenticateChatUser, getIndividualLeaderboard);

export default router;
