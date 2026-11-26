import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import { memoryUpload } from "../middlewares/multer.middleware.js";
import {
  uploadOrganisationDocument,
  getAllDocuments,
  deleteDocument,
  bulkDeleteDocuments,
} from "../controllers/organisationDocument.js";

const router = Router();

router.route("")
  .post(authenticateOrganisationActor, memoryUpload.single("upload_document"), uploadOrganisationDocument)
  .get(authenticateOrganisationActor, getAllDocuments);

router.route("/bulk-delete")
  .post(authenticateOrganisationActor, bulkDeleteDocuments);

router.route("/:file_id")
  .delete(authenticateOrganisationActor, deleteDocument);

export default router;
