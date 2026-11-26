import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { AssignTest } from "../models/AssignTest.js";
import { Test } from "../models/Test.js";
import { QuestionSummary } from "../models/QuestionSummary.js";
import { StudentTestAttempt } from "../models/StudentTestAttempt.js";
import {
  buildQuestionSnapshot,
  numberQuestions,
  toPublicQuestion,
} from "../utils/questionUtils.js";

export const getStudentAssignedTests = async (req, res) => {
  const student = req.current_student;
  const studentId = String(student._id);
  const orgId = String(student.organisation_id || "");

  const assigned = await AssignTest.find({
    organisation_id: orgId,
    "assigned_students.student_id": studentId,
  }).sort({ created_at: -1 });

  const result = [];
  for (const a of assigned) {
    const studentEntry = a.assigned_students.find((s) => s.student_id === studentId);
    const latestAttempt = await StudentTestAttempt.findOne({
      assigned_test_id: String(a._id),
      student_id: studentId,
    }).sort({ attempt_number: -1 });

    result.push({
      assigned_test_id: String(a._id),
      test_id: a.test_id,
      test_title: a.test_title,
      grade_id: a.grade_id,
      grade: a.grade,
      section: a.section,
      subject_id: a.subject_id,
      subject_name: a.subject_name,
      duration: a.duration,
      scheduled_date: a.scheduled_date,
      scheduled_time: a.scheduled_time,
      deadline_at: a.deadline_at,
      status: a.status,
      my_status: studentEntry?.status || "assigned",
      attempts_count: studentEntry?.attempts_count || 0,
      best_percentage: studentEntry?.best_percentage || 0,
      result: studentEntry?.result || null,
      latest_attempt_status: latestAttempt ? latestAttempt.status : null,
      latest_score: latestAttempt ? latestAttempt.score : null,
      created_at: a.created_at,
    });
  }

  return res.status(200).json(new ApiResponse("Assigned tests fetched successfully.", result));
};

export const getStudentAssignedTestDetails = async (req, res) => {
  const { assigned_test_id } = req.params;
  const student = req.current_student;

  if (!mongoose.Types.ObjectId.isValid(assigned_test_id)) {
    throw new ApiError(400, "Invalid Assigned Test ID.");
  }
  const studentId = String(student._id);
  const orgId = String(student.organisation_id || "");

  const assigned = await AssignTest.findOne({
    _id: assigned_test_id,
    organisation_id: orgId,
    "assigned_students.student_id": studentId,
  });
  if (!assigned) {
    throw new ApiError(404, "Assigned test not found for this student.");
  }

  const test = await Test.findById(assigned.test_id);
  if (!test) {
    throw new ApiError(404, "Test definition not found.");
  }

  const flatQuestions = buildQuestionSnapshot(test.toObject());
  const numbered = numberQuestions(flatQuestions);
  const publicQuestions = numbered.map(toPublicQuestion);

  const studentEntry = assigned.assigned_students.find((s) => s.student_id === studentId);

  const data = {
    assigned_test_id: String(assigned._id),
    test_id: String(test._id),
    test_title: test.test_title,
    grade_id: assigned.grade_id,
    grade: assigned.grade,
    section: assigned.section,
    subject_id: assigned.subject_id,
    subject_name: assigned.subject_name,
    duration: assigned.duration,
    scheduled_date: assigned.scheduled_date,
    scheduled_time: assigned.scheduled_time,
    deadline_at: assigned.deadline_at,
    status: assigned.status,
    my_status: studentEntry?.status || "assigned",
    total_questions: publicQuestions.length,
    questions: publicQuestions,
  };

  return res.status(200).json(new ApiResponse("Assigned test details fetched successfully.", data));
};

export const getStudentStudySummary = async (req, res) => {
  const { assigned_test_id } = req.params;
  const student = req.current_student;

  if (!mongoose.Types.ObjectId.isValid(assigned_test_id)) {
    throw new ApiError(400, "Invalid Assigned Test ID.");
  }
  const studentId = String(student._id);
  const orgId = String(student.organisation_id || "");

  const assigned = await AssignTest.findOne({
    _id: assigned_test_id,
    organisation_id: orgId,
    "assigned_students.student_id": studentId,
  });
  if (!assigned) {
    throw new ApiError(404, "Assigned test not found for this student.");
  }

  const test = await Test.findById(assigned.test_id);
  if (!test) {
    throw new ApiError(404, "Test not found.");
  }

  let summary = await QuestionSummary.findOne({ file_id: test.file_id });

  const data = {
    test_id: String(test._id),
    test_title: test.test_title,
    file_id: test.file_id,
    summary: summary?.summary || "Study summary covers key concepts and principles of the test syllabus.",
    key_points: summary?.key_points || ["Fundamental definitions", "Key techniques and methods", "Practical applications"],
  };

  return res.status(200).json(new ApiResponse("Study summary fetched successfully.", data));
};
