import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { AssignTest } from "../models/AssignTest.model.js";
import { StudentTestAttempt } from "../models/StudentTestAttempt.model.js";

export const getLiveTestsOverview = async (actor) => {
  const orgId = String(actor.organisation_id || actor._id);
  const now = new Date();

  const activeTests = await AssignTest.find({
    organisation_id: orgId,
    status: "active",
  }).sort({ created_at: -1 });

  const result = [];
  for (const a of activeTests) {
    const attempts = await StudentTestAttempt.find({
      assigned_test_id: String(a._id),
      status: "completed",
    });

    const topScore = attempts.reduce((max, cur) => Math.max(max, cur.percentage || 0), 0);

    result.push({
      assigned_test_id: String(a._id),
      test_title: a.test_title,
      subject_name: a.subject_name,
      grade: a.grade,
      section: a.section,
      total_students: a.assigned_students.length,
      participated_count: attempts.length,
      top_score_percentage: topScore,
      scheduled_date: a.scheduled_date,
      deadline_at: a.deadline_at,
    });
  }

  return {
    success: true,
    message: "Live tests overview fetched successfully.",
    data: result,
  };
};

export const getIndividualLeaderboard = async (assignedTestId, actor) => {
  if (!mongoose.Types.ObjectId.isValid(assignedTestId)) {
    throw new ApiError(400, "Invalid Assigned Test ID.");
  }

  const assigned = await AssignTest.findById(assignedTestId);
  if (!assigned) {
    throw new ApiError(404, "Assigned test not found.");
  }

  const attempts = await StudentTestAttempt.find({
    assigned_test_id: assignedTestId,
    status: "completed",
  });

  // Group by student to take best percentage & fastest time
  const studentMap = new Map();
  for (const att of attempts) {
    const sId = att.student_id;
    const existing = studentMap.get(sId);
    if (!existing || att.percentage > existing.percentage || 
       (att.percentage === existing.percentage && att.time_taken_seconds < existing.time_taken_seconds)) {
      studentMap.set(sId, {
        student_id: sId,
        student_name: att.student_name,
        score: att.score,
        total_marks: att.total_marks,
        percentage: att.percentage,
        time_taken_seconds: att.time_taken_seconds,
        submitted_at: att.submitted_at,
      });
    }
  }

  const ranked = Array.from(studentMap.values()).sort((a, b) => {
    if (b.percentage !== a.percentage) {
      return b.percentage - a.percentage;
    }
    return a.time_taken_seconds - b.time_taken_seconds;
  });

  const leaderboard = ranked.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));

  return {
    success: true,
    message: "Leaderboard fetched successfully.",
    data: {
      assigned_test_id: assignedTestId,
      test_title: assigned.test_title,
      leaderboard,
    },
  };
};

export const getLiveTestsOverviewController = async (req, res) => {
  const result = await getLiveTestsOverview(req.current_user);
  return res.status(200).json(result);
};

export const getIndividualLeaderboardController = async (req, res) => {
  const result = await getIndividualLeaderboard(
    req.params.assigned_test_id,
    req.current_user
  );
  return res.status(200).json(result);
};
