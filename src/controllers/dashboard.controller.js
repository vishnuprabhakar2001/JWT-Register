import { User } from "../models/user.model.js";
import { Grade } from "../models/Grade.model.js";
import { Subject } from "../models/Subject.model.js";
import { Test } from "../models/Test.model.js";
import { AssignTest } from "../models/AssignTest.model.js";
import { StudentTestAttempt } from "../models/StudentTestAttempt.model.js";
import { Material } from "../models/Material.model.js";
import { Reel } from "../models/Reel.model.js";

export const getOrganisationDashboard = async (lastDays, currentAdmin) => {
  const adminId = String(currentAdmin._id);
  const orgId = String(currentAdmin.organisation_id || adminId);

  const days = parseInt(lastDays || 30, 10);
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalStudents,
    totalGrades,
    totalSubjects,
    totalTests,
    totalAssignedTests,
    totalMaterials,
    totalReels,
    attempts,
  ] = await Promise.all([
    User.countDocuments({ organisation_id: orgId, role: "student", status: "active" }),
    Grade.countDocuments({ $or: [{ created_by: adminId }, { created_by: currentAdmin._id }] }),
    Subject.countDocuments({ $or: [{ created_by: adminId }, { created_by: currentAdmin._id }] }),
    Test.countDocuments({ organisation_admin_id: adminId }),
    AssignTest.countDocuments({ organisation_admin_id: adminId }),
    Material.countDocuments({ organisation_admin_id: adminId }),
    Reel.countDocuments({ organisation_admin_id: adminId }),
    StudentTestAttempt.find({
      submitted_at: { $gte: cutoffDate },
      status: "completed",
    }),
  ]);

  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((a) => a.passed).length;
  const avgScore =
    totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts
      : 0;

  return {
    success: true,
    message: "Dashboard analytics fetched successfully.",
    data: {
      overview: {
        total_students: totalStudents,
        total_grades: totalGrades,
        total_subjects: totalSubjects,
        total_tests_created: totalTests,
        total_tests_assigned: totalAssignedTests,
        total_materials: totalMaterials,
        total_reels: totalReels,
      },
      performance: {
        period_days: days,
        total_attempts_submitted: totalAttempts,
        passed_attempts: passedAttempts,
        failed_attempts: totalAttempts - passedAttempts,
        pass_rate_percentage: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 10000) / 100 : 0,
        average_score_percentage: Math.round(avgScore * 100) / 100,
      },
    },
  };
};

export const getOrganisationDashboardController = async (req, res) => {
  const result = await getOrganisationDashboard(
    req.body.last_days,
    req.current_admin
  );
  return res.status(200).json(result);
};
