import { Router } from "express";
import { verifyInternalSecret } from "../middlewares/auth.middleware.js";
import { syncCandidateOtp } from "../controllers/internalUser.js";

const router = Router();

// POST /api/organisations/sync-otp
router.route("/sync-otp").post(verifyInternalSecret, syncCandidateOtp);

export default router;
