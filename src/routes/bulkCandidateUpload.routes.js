import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import { memoryUpload } from "../middlewares/multer.middleware.js";
import {
  createBulkCandidateUploadController,
  listBulkCandidateUploadsController,
  downloadBulkCandidateUploadController,
  getBulkCandidateUploadErrorsController,
  bulkDeleteCandidateUploadsController,
  deleteBulkCandidatesController,
  createCandidatesController,
  getBulkCandidateUploadController,
  updateBulkCandidateUploadController,
  deleteBulkCandidateUploadController,
} from "../controllers/bulkCandidateUpload.controller.js";

const router = Router();

router.route("")
  .post(authenticateOrganisationActor, memoryUpload.single("file"), createBulkCandidateUploadController)
  .get(authenticateOrganisationActor, listBulkCandidateUploadsController);

router.route("/bulk-delete")
  .post(authenticateOrganisationActor, bulkDeleteCandidateUploadsController);

router.route("/candidates/delete")
  .post(authenticateOrganisationActor, deleteBulkCandidatesController);

router.route("/candidates")
  .post(authenticateOrganisationActor, createCandidatesController);

router.route("/:upload_id/download")
  .get(authenticateOrganisationActor, downloadBulkCandidateUploadController);

router.route("/:upload_id/errors")
  .get(authenticateOrganisationActor, getBulkCandidateUploadErrorsController);

router.route("/:upload_id")
  .get(authenticateOrganisationActor, getBulkCandidateUploadController)
  .put(authenticateOrganisationActor, updateBulkCandidateUploadController)
  .delete(authenticateOrganisationActor, deleteBulkCandidateUploadController);

export default router;
