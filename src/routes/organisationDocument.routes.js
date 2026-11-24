import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import { memoryUpload } from "../middlewares/multer.middleware.js";
import {
  uploadOrganisationDocumentController,
  getAllDocumentsController,
  deleteDocumentController,
  bulkDeleteDocumentsController,
} from "../controllers/organisationDocument.controller.js";

const router = Router();

router.route("")
  .post(authenticateOrganisationActor, memoryUpload.single("upload_document"), uploadOrganisationDocumentController)
  .get(authenticateOrganisationActor, getAllDocumentsController);

router.route("/bulk-delete")
  .post(authenticateOrganisationActor, bulkDeleteDocumentsController);

router.route("/:file_id")
  .delete(authenticateOrganisationActor, deleteDocumentController);

export default router;
