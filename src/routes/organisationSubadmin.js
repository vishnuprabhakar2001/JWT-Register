import { Router } from "express";
import { authenticateOrganisationAdmin } from "../middlewares/auth.middleware.js";
import {
  createSubAdmin,
  getAllSubAdmins,
  getSubAdmin,
  updateSubAdmin,
  deleteSubAdmin,
  blockSubAdmin,
  unblockSubAdmin,
} from "../controllers/organisationSubadmin.js";

const router = Router();

router.route("")
  .post(authenticateOrganisationAdmin, createSubAdmin)
  .get(authenticateOrganisationAdmin, getAllSubAdmins);

router.route("/:subadmin_id")
  .get(authenticateOrganisationAdmin, getSubAdmin)
  .patch(authenticateOrganisationAdmin, updateSubAdmin)
  .delete(authenticateOrganisationAdmin, deleteSubAdmin);

router.route("/:subadmin_id/block")
  .post(authenticateOrganisationAdmin, blockSubAdmin);

router.route("/:subadmin_id/unblock")
  .post(authenticateOrganisationAdmin, unblockSubAdmin);

export default router;
