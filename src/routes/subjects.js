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

router.route("")
  .post(authenticateOrganisationActor, addSubject)
  .get(authenticateOrganisationActor, getAllSubjects);

router.route("/:subject_id")
  .get(authenticateOrganisationActor, getSubjectById)
  .put(authenticateOrganisationActor, updateSubject)
  .delete(authenticateOrganisationActor, deleteSubject);

export default router;
