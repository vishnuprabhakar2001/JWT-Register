import { Router } from "express";
import { verifyInternalSecret } from "../middlewares/auth.middleware.js";
import { syncCandidateOtpController } from "../controllers/internalUser.controller.js";

const router = Router();

// POST /api/organisations/sync-otp
router.route("/sync-otp").post(verifyInternalSecret, syncCandidateOtpController);

export default router;
