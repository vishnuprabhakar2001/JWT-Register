import { Router } from "express";
import { authenticateOrganisationAdmin } from "../middlewares/auth.middleware.js";
import {
  createSubAdminController,
  getAllSubAdminsController,
  getSubAdminController,
  updateSubAdminController,
  deleteSubAdminController,
  blockSubAdminController,
  unblockSubAdminController,
} from "../controllers/organisationSubadmin.controller.js";

const router = Router();

router.route("")
  .post(authenticateOrganisationAdmin, createSubAdminController)
  .get(authenticateOrganisationAdmin, getAllSubAdminsController);

router.route("/:subadmin_id")
  .get(authenticateOrganisationAdmin, getSubAdminController)
  .patch(authenticateOrganisationAdmin, updateSubAdminController)
  .delete(authenticateOrganisationAdmin, deleteSubAdminController);

router.route("/:subadmin_id/block")
  .post(authenticateOrganisationAdmin, blockSubAdminController);

router.route("/:subadmin_id/unblock")
  .post(authenticateOrganisationAdmin, unblockSubAdminController);

export default router;
