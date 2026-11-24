import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import {
  addSubjectController,
  updateSubjectController,
  getSubjectByIdController,
  getAllSubjectsController,
  deleteSubjectController,
} from "../controllers/subject.controller.js";

const router = Router();

router.route("/add_subject").post(authenticateOrganisationActor, addSubjectController);
router.route("/update_subject/:subject_id").put(authenticateOrganisationActor, updateSubjectController);
router.route("/get_subject_by_id/:subject_id").get(authenticateOrganisationActor, getSubjectByIdController);
router.route("/get_all_subject").get(authenticateOrganisationActor, getAllSubjectsController);
router.route("/delete_subject/:subject_id").delete(authenticateOrganisationActor, deleteSubjectController);

export default router;
