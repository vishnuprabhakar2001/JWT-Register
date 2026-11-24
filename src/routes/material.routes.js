import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import { memoryUpload } from "../middlewares/multer.middleware.js";
import {
  uploadMaterialController,
  getAllMaterialsController,
  downloadMaterialController,
  viewMaterialFileController,
  deleteMaterialController,
} from "../controllers/material.controller.js";

const router = Router();

router.route("/upload_material")
  .post(authenticateOrganisationActor, memoryUpload.single("material_file"), uploadMaterialController);

router.route("/get_all_materials")
  .get(authenticateOrganisationActor, getAllMaterialsController);

router.route("/download_material/:material_id")
  .get(authenticateOrganisationActor, downloadMaterialController);

router.route("/file/:material_id")
  .get(authenticateOrganisationActor, viewMaterialFileController);

router.route("/delete_material/:material_id")
  .delete(authenticateOrganisationActor, deleteMaterialController);

export default router;
