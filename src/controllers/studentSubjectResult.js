import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { AssignTest } from "../models/AssignTest.js";
import { Subject } from "../models/Subject.js";
import { StudentTestAttempt } from "../models/StudentTestAttempt.js";

export const getSubjectAttemptResults = async (req, res) => {
  const { subject_id } = req.params;
  const student = req.current_student;

  if (!mongoose.Types.ObjectId.isValid(subject_id)) {
    throw new ApiError(400, "Invalid Subject ID.");
  }
  const studentId = String(student._id);
  const orgId = String(student.organisation_id || "");

  const subject = await Subject.findById(subject_id);
  if (!subject) {
    throw new ApiError(404, "Subject not found.");
  }

  // Find all assigned tests for this subject
  const assignedTests = await AssignTest.find({
    organisation_id: orgId,
    subject_id,
    "assigned_students.student_id": studentId,
  });

  const assignedTestIds = assignedTests.map((a) => String(a._id));
  const attempts = await StudentTestAttempt.find({
    assigned_test_id: { $in: assignedTestIds },
    student_id: studentId,
    status: "completed",
  }).sort({ submitted_at: -1 });

  let totalPercentage = 0;
  const testResults = [];

  for (const a of assignedTests) {
    const aId = String(a._id);
    const studentAttempts = attempts.filter((att) => att.assigned_test_id === aId);
    const bestAttempt = studentAttempts.reduce(
      (best, cur) => (cur.percentage > (best?.percentage || 0) ? cur : best),
      null
    );

    if (bestAttempt) {
      totalPercentage += bestAttempt.percentage;
    }

    testResults.push({
      assigned_test_id: aId,
      test_id: a.test_id,
      test_title: a.test_title,
      attempts_count: studentAttempts.length,
      best_score: bestAttempt?.score || 0,
      best_percentage: bestAttempt?.percentage || 0,
      passed: bestAttempt ? bestAttempt.passed : false,
      last_submitted_at: bestAttempt?.submitted_at || null,
    });
  }

  const attemptedCount = testResults.filter((t) => t.attempts_count > 0).length;
  const avgPercentage = attemptedCount > 0 ? totalPercentage / attemptedCount : 0;

  const data = {
    student_id: studentId,
    student_name: student.name,
    subject_id,
    subject_name: subject.subject_name,
    average_score_percentage: Math.round(avgPercentage * 100) / 100,
    total_assigned_tests: assignedTests.length,
    attempted_tests: attemptedCount,
    tests: testResults,
  };

  return res.status(200).json(new ApiResponse("Subject test performance fetched successfully.", data));
};
