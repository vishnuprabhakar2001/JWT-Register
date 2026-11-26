import { Router } from "express";
import { authenticateStudent } from "../middlewares/auth.middleware.js";
import {
  getStudentMaterials,
  downloadStudentMaterial,
} from "../controllers/material.js";

const router = Router();

router.route("/get_all_materials").get(authenticateStudent, getStudentMaterials);
router.route("/download_material/:material_id").get(authenticateStudent, downloadStudentMaterial);

export default router;
