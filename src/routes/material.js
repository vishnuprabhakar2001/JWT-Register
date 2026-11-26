import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import { memoryUpload } from "../middlewares/multer.middleware.js";
import {
  uploadMaterial,
  getAllMaterials,
  downloadMaterial,
  viewMaterialFile,
  deleteMaterial,
} from "../controllers/material.js";

const router = Router();

router.route("/upload_material")
  .post(authenticateOrganisationActor, memoryUpload.single("material_file"), uploadMaterial);

router.route("/get_all_materials")
  .get(authenticateOrganisationActor, getAllMaterials);

router.route("/download_material/:material_id")
  .get(authenticateOrganisationActor, downloadMaterial);

router.route("/file/:material_id")
  .get(authenticateOrganisationActor, viewMaterialFile);

router.route("/delete_material/:material_id")
  .delete(authenticateOrganisationActor, deleteMaterial);

export default router;
