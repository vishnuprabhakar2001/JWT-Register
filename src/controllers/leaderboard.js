import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { AssignTest } from "../models/AssignTest.js";
import { StudentTestAttempt } from "../models/StudentTestAttempt.js";

export const getLiveTestsOverview = async (req, res) => {
  const actor = req.current_user;
  const orgId = String(actor.organisation_id || actor._id);

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

  return res.status(200).json(new ApiResponse("Live tests overview fetched successfully.", result));
};

export const getIndividualLeaderboard = async (req, res) => {
  const { assigned_test_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(assigned_test_id)) {
    throw new ApiError(400, "Invalid Assigned Test ID.");
  }

  const assigned = await AssignTest.findById(assignedTestId || assigned_test_id);
  if (!assigned) {
    throw new ApiError(404, "Assigned test not found.");
  }

  const attempts = await StudentTestAttempt.find({
    assigned_test_id,
    status: "completed",
  });

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

  const data = {
    assigned_test_id,
    test_title: assigned.test_title,
    leaderboard,
  };

  return res.status(200).json(new ApiResponse("Leaderboard fetched successfully.", data));
};
