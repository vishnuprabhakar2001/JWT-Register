import mongoose from "mongoose";

const assignedStudentSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true, index: true },
    student_name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    status: { type: String, default: "assigned" },
    attempts_count: { type: Number, default: 0 },
    best_percentage: { type: Number, default: 0 },
    result: { type: String, default: null },
    submitted_at: { type: Date, default: null },
  },
  { _id: false }
);

const assignTestSchema = new mongoose.Schema(
  {
    test_id: { type: String, required: true, index: true },
    test_title: { type: String, required: true },
    file_id: { type: String, default: "" },
    grade_id: { type: String, required: true, index: true },
    grade: { type: String, default: "" },
    section: { type: String, default: "" },
    subject_id: { type: String, default: "", index: true },
    subject_name: { type: String, default: "" },
    duration: { type: Number, default: 30 },
    scheduled_date: { type: String, default: "" },
    scheduled_time: { type: String, default: "" },
    deadline_at: { type: Date, default: null, index: true },
    status: { type: String, default: "active", index: true },
    assigned_students: { type: [assignedStudentSchema], default: [] },
    organisation_admin_id: { type: String, required: true, index: true },
    organisation_id: { type: String, required: true, index: true },
    created_by: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "assign_tests",
  }
);

assignTestSchema.index({
  organisation_admin_id: 1,
  organisation_id: 1,
  created_at: -1,
});

assignTestSchema.index({
  organisation_id: 1,
  "assigned_students.student_id": 1,
});

export const AssignTest = mongoose.model("AssignTest", assignTestSchema);
export default AssignTest;
