import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { AssignTest } from "../models/AssignTest.js";
import { StudentTestAttempt } from "../models/StudentTestAttempt.js";

export const getAllTestResults = async (req, res) => {
  const currentAdmin = req.current_admin;
  const adminId = String(currentAdmin._id);
  const assigned = await AssignTest.find({
    organisation_admin_id: adminId,
  }).sort({ created_at: -1 });

  const overview = [];
  for (const a of assigned) {
    const totalStudents = a.assigned_students.length;
    const completedStudents = a.assigned_students.filter((s) => s.status === "completed");
    const passedStudents = a.assigned_students.filter((s) => s.result === "Pass");

    const avgPercentage =
      completedStudents.length > 0
        ? completedStudents.reduce((sum, s) => sum + (s.best_percentage || 0), 0) /
          completedStudents.length
        : 0;

    overview.push({
      assigned_test_id: String(a._id),
      test_id: a.test_id,
      test_title: a.test_title,
      grade_id: a.grade_id,
      grade: a.grade,
      section: a.section,
      subject_id: a.subject_id,
      subject_name: a.subject_name,
      total_candidates: totalStudents,
      completed_count: completedStudents.length,
      passed_count: passedStudents.length,
      failed_count: completedStudents.length - passedStudents.length,
      average_percentage: Math.round(avgPercentage * 100) / 100,
      scheduled_date: a.scheduled_date,
      deadline_at: a.deadline_at,
      status: a.status,
    });
  }

  return res.status(200).json(new ApiResponse("Test results overview fetched successfully.", overview));
};

export const getAssignedTestResult = async (req, res) => {
  const { assigned_test_id } = req.params;
  const currentAdmin = req.current_admin;

  if (!mongoose.Types.ObjectId.isValid(assigned_test_id)) {
    throw new ApiError(400, "Invalid Assigned Test ID.");
  }
  const adminId = String(currentAdmin._id);
  const assigned = await AssignTest.findOne({
    _id: assigned_test_id,
    organisation_admin_id: adminId,
  });
  if (!assigned) {
    throw new ApiError(404, "Assigned test not found.");
  }

  const attempts = await StudentTestAttempt.find({
    assigned_test_id,
    status: "completed",
  }).sort({ submitted_at: -1 });

  const studentResults = assigned.assigned_students.map((student) => {
    const studentAttempts = attempts.filter((att) => att.student_id === student.student_id);
    const bestAttempt = studentAttempts.reduce(
      (best, cur) => (cur.percentage > (best?.percentage || 0) ? cur : best),
      null
    );

    return {
      student_id: student.student_id,
      student_name: student.student_name,
      email: student.email,
      phone: student.phone,
      status: student.status,
      attempts_count: studentAttempts.length,
      best_score: bestAttempt?.score || 0,
      total_marks: bestAttempt?.total_marks || 0,
      best_percentage: bestAttempt?.percentage || 0,
      result: student.result || (bestAttempt ? (bestAttempt.passed ? "Pass" : "Fail") : "Pending"),
      submitted_at: bestAttempt?.submitted_at || null,
    };
  });

  const data = {
    assigned_test_id: String(assigned._id),
    test_id: assigned.test_id,
    test_title: assigned.test_title,
    grade_id: assigned.grade_id,
    grade: assigned.grade,
    section: assigned.section,
    subject_id: assigned.subject_id,
    subject_name: assigned.subject_name,
    total_candidates: assigned.assigned_students.length,
    candidates: studentResults,
  };

  return res.status(200).json(new ApiResponse("Test results fetched successfully.", data));
};
