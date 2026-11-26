import { StudentTestAttempt } from "../models/StudentTestAttempt.js";
import { AssignTest } from "../models/AssignTest.js";

let monitorInterval = null;

export const checkDeadlines = async () => {
  try {
    const now = new Date();

    // 1. Find expired active test attempts
    const expiredAttempts = await StudentTestAttempt.find({
      status: "in_progress",
      deadline_at: { $lte: now },
    });

    for (const attempt of expiredAttempts) {
      attempt.status = "not_submitted";
      await attempt.save();
    }

    // 2. Close expired assigned tests
    await AssignTest.updateMany(
      {
        status: "active",
        deadline_at: { $lte: now },
      },
      {
        $set: { status: "closed" },
      }
    );
  } catch (err) {
    console.warn("[TestDeadlineService] Error during deadline scan:", err.message);
  }
};

export const startDeadlineMonitor = (intervalSeconds = 15) => {
  if (monitorInterval) clearInterval(monitorInterval);
  monitorInterval = setInterval(checkDeadlines, intervalSeconds * 1000);
  console.log(`Test deadline monitor started (every ${intervalSeconds}s).`);
};

export const stopDeadlineMonitor = () => {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
};
