import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import {
  getStudentMaterialsController,
  downloadStudentMaterialController,
} from "../controllers/material.controller.js";

const router = Router();

router.route("/get_all_materials").get(authenticateStudent, getStudentMaterialsController);
router.route("/download_material/:material_id").get(authenticateStudent, downloadStudentMaterialController);

export default router;
