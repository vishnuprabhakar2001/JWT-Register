import express from "express";
import {
  registerUser,
  updateProfile,
  getProfile,
} from "../controllers/user.controller.js";
// import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/registration", registerUser);

router.put("/profileupdate", upload.single("profileImage"), updateProfile);

router.post("/getprofile", getProfile);

export default router;
