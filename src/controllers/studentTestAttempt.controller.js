import asyncHandler from "../middlewares/asyncHandler.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { AssignTest } from "../models/AssignTest.model.js";
import { Test } from "../models/Test.model.js";
import { StudentTestAttempt } from "../models/StudentTestAttempt.model.js";
import { gradeAnswer } from "../utils/answerGrader.js";
import {
  buildQuestionSnapshot,
  numberQuestions,
  shuffledCopy,
  toPublicQuestion,
} from "../utils/questionUtils.js";

const SUBMIT_GRACE_SECONDS = 120;

export const startTest = async (assignedTestId, student, attemptType = "test") => {
  if (!mongoose.Types.ObjectId.isValid(assignedTestId)) {
    throw new ApiError(400, "Invalid Assigned Test ID.");
  }
  const studentId = String(student._id);
  const orgId = String(student.organisation_id || "");

  const assigned = await AssignTest.findOne({
    _id: assignedTestId,
    organisation_id: orgId,
    "assigned_students.student_id": studentId,
  });
  if (!assigned) {
    throw new ApiError(404, "Test is not assigned to you.");
  }

  const now = new Date();
  if (assigned.deadline_at && new Date(assigned.deadline_at) < now) {
    throw new ApiError(400, "The deadline for this test has already passed.");
  }

  // Check for existing active attempt (resume)
  let activeAttempt = await StudentTestAttempt.findOne({
    assigned_test_id: assignedTestId,
    student_id: studentId,
    attempt_type: attemptType,
    status: "in_progress",
  });

  if (activeAttempt) {
    // Check if expired
    if (activeAttempt.deadline_at && new Date(activeAttempt.deadline_at) < now) {
      activeAttempt.status = "not_submitted";
      await activeAttempt.save();
    } else {
      // Resume existing attempt
      const remainingSeconds = Math.max(
        0,
        Math.floor((new Date(activeAttempt.deadline_at).getTime() - now.getTime()) / 1000)
      );
      const publicQuestions = (activeAttempt.questions || []).map(toPublicQuestion);
      return {
        success: true,
        message: "Resuming existing attempt.",
        data: {
          attempt_id: String(activeAttempt._id),
          assigned_test_id: assignedTestId,
          test_title: assigned.test_title,
          attempt_number: activeAttempt.attempt_number,
          attempt_type: activeAttempt.attempt_type,
          duration_minutes: assigned.duration,
          remaining_seconds: remainingSeconds,
          deadline_at: activeAttempt.deadline_at,
          questions: publicQuestions,
          saved_answers: activeAttempt.answers || {},
        },
      };
    }
  }

  // Create new attempt
  const test = await Test.findById(assigned.test_id);
  if (!test) {
    throw new ApiError(404, "Test definition not found.");
  }

  const lastAttempt = await StudentTestAttempt.findOne({
    assigned_test_id: assignedTestId,
    student_id: studentId,
  }).sort({ attempt_number: -1 });

  const nextAttemptNum = (lastAttempt?.attempt_number || 0) + 1;

  let flatQuestions = buildQuestionSnapshot(test.toObject());
  if (attemptType === "retest") {
    flatQuestions = shuffledCopy(flatQuestions);
  }
  const questionsSnapshot = numberQuestions(flatQuestions);

  const durationMinutes = assigned.duration || test.duration || 30;
  const deadlineAt = new Date(
    now.getTime() + durationMinutes * 60 * 1000 + SUBMIT_GRACE_SECONDS * 1000
  );

  const attempt = await StudentTestAttempt.create({
    assigned_test_id: assignedTestId,
    test_id: String(test._id),
    student_id: studentId,
    student_name: student.name || "",
    student_email: student.email || "",
    attempt_number: nextAttemptNum,
    attempt_type: attemptType,
    status: "in_progress",
    started_at: now,
    deadline_at: deadlineAt,
    total_questions: questionsSnapshot.length,
    questions: questionsSnapshot,
    answers: {},
  });

  const publicQuestions = questionsSnapshot.map(toPublicQuestion);

  return {
    success: true,
    message: "Test started successfully.",
    data: {
      attempt_id: String(attempt._id),
      assigned_test_id: assignedTestId,
      test_title: assigned.test_title,
      attempt_number: nextAttemptNum,
      attempt_type: attemptType,
      duration_minutes: durationMinutes,
      remaining_seconds: durationMinutes * 60,
      deadline_at: deadlineAt,
      questions: publicQuestions,
    },
  };
};

export const submitTest = async (attemptId, payload, student) => {
  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    throw new ApiError(400, "Invalid Attempt ID.");
  }
  const studentId = String(student._id);

  const attempt = await StudentTestAttempt.findOne({
    _id: attemptId,
    student_id: studentId,
  });
  if (!attempt) {
    throw new ApiError(404, "Test attempt not found.");
  }
  if (attempt.status !== "in_progress") {
    throw new ApiError(400, `Attempt cannot be submitted. Current status: ${attempt.status}`);
  }

  const now = new Date();
  const submittedAnswers = payload.answers || [];
  const answersMap = {};
  for (const item of submittedAnswers) {
    if (item.question_id) {
      answersMap[item.question_id] = item.answer;
    }
  }

  const questionsSnapshot = attempt.questions || [];
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  let totalScore = 0;
  let maxPossibleScore = 0;

  const results = [];

  for (const q of questionsSnapshot) {
    const qId = q.question_id;
    const studentAns = answersMap[qId];
    const maxMarks = q.max_marks || 1;
    maxPossibleScore += maxMarks;

    if (studentAns === undefined || studentAns === null || String(studentAns).trim() === "") {
      unansweredCount++;
      results.push({
        question_id: qId,
        question_no: q.question_no,
        question: q.question,
        question_type: q.question_type,
        difficulty_level: q.difficulty_level,
        options: q.options,
        student_answer: null,
        correct_answer: q.correct_answer || q.correct_option_id,
        is_correct: false,
        marks_awarded: 0,
        max_marks: maxMarks,
        explanation: q.explanation || "",
      });
      continue;
    }

    const isCorrect = gradeAnswer(studentAns, q);
    if (isCorrect) {
      correctCount++;
      totalScore += maxMarks;
    } else {
      incorrectCount++;
    }

    results.push({
      question_id: qId,
      question_no: q.question_no,
      question: q.question,
      question_type: q.question_type,
      difficulty_level: q.difficulty_level,
      options: q.options,
      student_answer: studentAns,
      correct_answer: q.correct_answer || q.correct_option_id,
      is_correct: isCorrect,
      marks_awarded: isCorrect ? maxMarks : 0,
      max_marks: maxMarks,
      explanation: q.explanation || "",
    });
  }

  const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  const passed = percentage >= 50;
  const timeTaken = Math.max(0, Math.floor((now.getTime() - new Date(attempt.started_at).getTime()) / 1000));

  attempt.status = "completed";
  attempt.submitted_at = now;
  attempt.time_taken_seconds = timeTaken;
  attempt.score = totalScore;
  attempt.total_marks = maxPossibleScore;
  attempt.correct_count = correctCount;
  attempt.incorrect_count = incorrectCount;
  attempt.unanswered_count = unansweredCount;
  attempt.percentage = Math.round(percentage * 100) / 100;
  attempt.passed = passed;
  attempt.answers = answersMap;
  attempt.results = results;

  await attempt.save();

  // Update assigned test progress
  const assigned = await AssignTest.findById(attempt.assigned_test_id);
  if (assigned) {
    const studentIdx = assigned.assigned_students.findIndex((s) => s.student_id === studentId);
    if (studentIdx !== -1) {
      const entry = assigned.assigned_students[studentIdx];
      entry.attempts_count = (entry.attempts_count || 0) + 1;
      entry.best_percentage = Math.max(entry.best_percentage || 0, attempt.percentage);
      entry.status = "completed";
      entry.result = passed ? "Pass" : "Fail";
      entry.submitted_at = now;
      assigned.markModified("assigned_students");
      await assigned.save();
    }
  }

  return {
    success: true,
    message: "Test submitted successfully.",
    data: {
      attempt_id: String(attempt._id),
      assigned_test_id: attempt.assigned_test_id,
      attempt_number: attempt.attempt_number,
      attempt_type: attempt.attempt_type,
      score: totalScore,
      total_marks: maxPossibleScore,
      percentage: attempt.percentage,
      passed,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      unanswered_count: unansweredCount,
      time_taken_seconds: timeTaken,
      submitted_at: now,
      results,
    },
  };
};

export const getStudentTestHistory = async (student) => {
  const studentId = String(student._id);
  const attempts = await StudentTestAttempt.find({
    student_id: studentId,
  }).sort({ submitted_at: -1, started_at: -1 });

  return {
    success: true,
    message: "Test history fetched successfully.",
    data: attempts.map((a) => ({
      attempt_id: String(a._id),
      assigned_test_id: a.assigned_test_id,
      test_id: a.test_id,
      attempt_number: a.attempt_number,
      attempt_type: a.attempt_type,
      status: a.status,
      score: a.score,
      total_marks: a.total_marks,
      percentage: a.percentage,
      passed: a.passed,
      started_at: a.started_at,
      submitted_at: a.submitted_at,
      time_taken_seconds: a.time_taken_seconds,
    })),
  };
};

export const startStudentTestController = asyncHandler(async (req, res) => {
  const result = await startTest(
    req.params.assigned_test_id,
    req.current_student,
    "test"
  );
  return res.status(200).json(result);
});

export const startStudentRetestController = asyncHandler(async (req, res) => {
  const result = await startTest(
    req.params.assigned_test_id,
    req.current_student,
    "retest"
  );
  return res.status(200).json(result);
});

export const submitStudentTestController = asyncHandler(async (req, res) => {
  const result = await submitTest(
    req.params.attempt_id,
    req.body,
    req.current_student
  );
  return res.status(200).json(result);
});

export const getStudentTestHistoryController = asyncHandler(async (req, res) => {
  const result = await getStudentTestHistory(req.current_student);
  return res.status(200).json(result);
});
