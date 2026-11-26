import { Router } from "express";
import { authenticateOrganisationActor } from "../middlewares/auth.middleware.js";
import {
  addSubject,
  updateSubject,
  getSubjectById,
  getAllSubjects,
  deleteSubject,
} from "../controllers/subject.js";

const router = Router();

// Standard REST endpoints
router.route("")
  .post(authenticateOrganisationActor, addSubject)
  .get(authenticateOrganisationActor, getAllSubjects);

// Python RPC endpoints compatibility
router.route("/add_subject")
  .post(authenticateOrganisationActor, addSubject);

router.route("/get_all_subject")
  .get(authenticateOrganisationActor, getAllSubjects);

router.route("/get_subject_by_id/:subject_id")
  .get(authenticateOrganisationActor, getSubjectById);

router.route("/update_subject/:subject_id")
  .put(authenticateOrganisationActor, updateSubject);

router.route("/delete_subject/:subject_id")
  .delete(authenticateOrganisationActor, deleteSubject);

// REST id routes
router.route("/:subject_id")
  .get(authenticateOrganisationActor, getSubjectById)
  .put(authenticateOrganisationActor, updateSubject)
  .delete(authenticateOrganisationActor, deleteSubject);

export default router;
