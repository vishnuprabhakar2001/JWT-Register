import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { AssignTest } from "../models/AssignTest.model.js";
import { Subject } from "../models/Subject.model.js";
import { StudentTestAttempt } from "../models/StudentTestAttempt.model.js";

export const getSubjectAttemptResults = async (subjectId, student) => {
  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    throw new ApiError(400, "Invalid Subject ID.");
  }
  const studentId = String(student._id);
  const orgId = String(student.organisation_id || "");

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new ApiError(404, "Subject not found.");
  }

  // Find all assigned tests for this subject
  const assignedTests = await AssignTest.find({
    organisation_id: orgId,
    subject_id: subjectId,
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

  return {
    success: true,
    message: "Subject test performance fetched successfully.",
    data: {
      student_id: studentId,
      student_name: student.name,
      subject_id: subjectId,
      subject_name: subject.subject_name,
      average_score_percentage: Math.round(avgPercentage * 100) / 100,
      total_assigned_tests: assignedTests.length,
      attempted_tests: attemptedCount,
      tests: testResults,
    },
  };
};

export const getSubjectAttemptResultsController = async (req, res) => {
  const result = await getSubjectAttemptResults(
    req.params.subject_id,
    req.current_student
  );
  return res.status(200).json(result);
};
