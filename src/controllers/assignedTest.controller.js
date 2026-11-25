import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { Test } from "../models/Test.model.js";
import { User } from "../models/user.model.js";
import { AssignTest } from "../models/AssignTest.model.js";
import { Notification } from "../models/Notification.model.js";

export const assignTest = async (payload, currentAdmin) => {
  const { test_id, scheduled_date, scheduled_time, duration } = payload;
  if (!test_id) {
    throw new ApiError(400, "test_id is required.");
  }
  if (!mongoose.Types.ObjectId.isValid(test_id)) {
    throw new ApiError(400, "Invalid Test ID.");
  }

  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const test = await Test.findOne({ _id: test_id, organisation_admin_id: String(adminId) });
  if (!test) {
    throw new ApiError(404, "Test not found.");
  }

  // Find all active students in the test's grade and section
  const studentQuery = {
    organisation_id: orgId,
    grade_id: test.grade_id,
    role: "student",
    status: "active",
  };
  if (test.section) {
    studentQuery.section = test.section;
  }

  const students = await User.find(studentQuery);
  if (students.length === 0) {
    throw new ApiError(404, "No active students found in this grade/section to assign the test.");
  }

  const assignedStudents = students.map((s) => ({
    student_id: String(s._id),
    student_name: s.name,
    email: s.email || "",
    phone: s.phone,
    status: "assigned",
    attempts_count: 0,
    best_percentage: 0,
    result: null,
    submitted_at: null,
  }));

  let deadlineAt = null;
  if (scheduled_date && scheduled_time) {
    try {
      deadlineAt = new Date(`${scheduled_date}T${scheduled_time}`);
    } catch {
      deadlineAt = new Date(Date.now() + (duration || test.duration || 30) * 60 * 1000);
    }
  } else {
    deadlineAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default
  }

  const assigned = await AssignTest.create({
    test_id: String(test._id),
    test_title: test.test_title,
    file_id: test.file_id,
    grade_id: test.grade_id,
    grade: test.grade,
    section: test.section,
    subject_id: test.subject_id,
    subject_name: test.subject_name,
    duration: duration || test.duration,
    scheduled_date: scheduled_date || "",
    scheduled_time: scheduled_time || "",
    deadline_at: deadlineAt,
    status: "active",
    assigned_students: assignedStudents,
    organisation_admin_id: String(adminId),
    organisation_id: orgId,
    created_by: adminId,
  });

  // Create notifications for students
  const notifications = students.map((s) => ({
    recipient_student_id: String(s._id),
    organisation_id: orgId,
    title: "New Test Assigned",
    body: `A new test "${test.test_title}" has been assigned to you.`,
    type: "test_assigned",
    is_read: false,
    data: {
      assigned_test_id: String(assigned._id),
      test_id: String(test._id),
      test_title: test.test_title,
    },
  }));

  try {
    await Notification.insertMany(notifications);
  } catch (err) {
    console.warn("Could not write test assignment notifications:", err.message);
  }

  return {
    success: true,
    message: "Test assigned successfully.",
    data: {
      assigned_test_id: String(assigned._id),
      test_id: String(test._id),
      test_title: test.test_title,
      students_assigned_count: assignedStudents.length,
      scheduled_date: assigned.scheduled_date,
      scheduled_time: assigned.scheduled_time,
      deadline_at: assigned.deadline_at,
    },
  };
};

export const getAllAssignedTests = async (currentAdmin) => {
  const adminId = String(currentAdmin._id);
  const list = await AssignTest.find({
    organisation_admin_id: adminId,
  }).sort({ created_at: -1 });

  return {
    success: true,
    message: "Assigned tests fetched successfully.",
    data: list.map((a) => {
      const total = a.assigned_students.length;
      const completed = a.assigned_students.filter((s) => s.status === "completed").length;
      return {
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
        total_assigned: total,
        completed_count: completed,
        created_at: a.created_at,
      };
    }),
  };
};

export const deleteAssignedTest = async (assignedTestId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(assignedTestId)) {
    throw new ApiError(400, "Invalid Assigned Test ID.");
  }
  const adminId = String(currentAdmin._id);
  const result = await AssignTest.deleteOne({
    _id: assignedTestId,
    organisation_admin_id: adminId,
  });
  if (result.deletedCount === 0) {
    throw new ApiError(404, "Assigned test not found.");
  }

  return {
    success: true,
    message: "Assigned test deleted successfully.",
  };
};

export const assignTestController = async (req, res) => {
  const result = await assignTest(req.body, req.current_admin);
  return res.status(201).json(result);
};

export const getAllAssignedTestsController = async (req, res) => {
  const result = await getAllAssignedTests(req.current_admin);
  return res.status(200).json(result);
};

export const deleteAssignedTestController = async (req, res) => {
  const result = await deleteAssignedTest(req.params.assigned_test_id, req.current_admin);
  return res.status(200).json(result);
};
