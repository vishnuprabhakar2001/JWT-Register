import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import { memoryUpload } from "../middlewares/multer.middleware.js";
import {
  createBulkCandidateUpload,
  listBulkCandidateUploads,
  downloadBulkCandidateUpload,
  getBulkCandidateUploadErrors,
  bulkDeleteCandidateUploads,
  deleteBulkCandidates,
  createCandidates,
  getBulkCandidateUpload,
  updateBulkCandidateUpload,
  deleteBulkCandidateUpload,
} from "../controllers/bulkCandidateUpload.js";

const router = Router();

router.route("")
  .post(authenticateOrganisationActor, memoryUpload.single("file"), createBulkCandidateUpload)
  .get(authenticateOrganisationActor, listBulkCandidateUploads);

router.route("/bulk-delete")
  .post(authenticateOrganisationActor, bulkDeleteCandidateUploads);

router.route("/candidates/delete")
  .post(authenticateOrganisationActor, deleteBulkCandidates);

router.route("/candidates")
  .post(authenticateOrganisationActor, createCandidates);

router.route("/:upload_id/download")
  .get(authenticateOrganisationActor, downloadBulkCandidateUpload);

router.route("/:upload_id/errors")
  .get(authenticateOrganisationActor, getBulkCandidateUploadErrors);

router.route("/:upload_id")
  .get(authenticateOrganisationActor, getBulkCandidateUpload)
  .put(authenticateOrganisationActor, updateBulkCandidateUpload)
  .delete(authenticateOrganisationActor, deleteBulkCandidateUpload);

export default router;
