import { Router } from "express";
import {
  registerUser,
  loginUser,
  updateUser,
  getAllUsers,
  getuserById,
} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/update").patch(authMiddleware, updateUser);
router.route("/getallusers").get(authMiddleware, getAllUsers);
router.route("/getuser/:id").get(authMiddleware, getuserById);

export default router;
