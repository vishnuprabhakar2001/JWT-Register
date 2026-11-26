import { StudentUsageSession } from "../models/StudentUsageSession.js";
import { User } from "../models/user.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto";

const PERSISTENCE_THROTTLE_SECONDS = 30;
const STALE_TIMEOUT_SECONDS = 150;
const GRACE_PERIOD_SECONDS = 60;
const ALLOWED_END_REASONS = new Set([
  "app_background",
  "screen_lock",
  "user_exit",
  "logout",
  "socket_disconnect",
  "stale_timeout",
  "superseded",
]);

export const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const startUsageSession = async ({
  student,
  authSessionId,
  connectionId,
  jwtExp,
  correlationId,
}) => {
  const now = new Date();
  if (jwtExp && Math.floor(now.getTime() / 1000) >= jwtExp) {
    throw new Error("JWT_EXPIRED");
  }

  const studentId = student._id;
  const orgId = String(student.organisation_id || "");

  // Verify student is active and session matches
  const validStudent = await User.findOne({
    _id: studentId,
    role: "student",
    status: "active",
    organisation_id: orgId,
    active_session_id: authSessionId,
  });
  if (!validStudent) {
    throw new Error("INVALID_AUTHENTICATION_SESSION");
  }

  // Check existing active session
  const existing = await StudentUsageSession.findOne({
    student_id: studentId,
    organisation_id: orgId,
    status: "active",
  });

  if (existing) {
    const lastActive = existing.last_active_at || existing.started_at;
    const gap = (now.getTime() - new Date(lastActive).getTime()) / 1000;

    if (gap > STALE_TIMEOUT_SECONDS) {
      await closeSessionInternal(existing, lastActive, "stale_timeout");
    } else if (
      existing.connection_id === connectionId &&
      existing.auth_session_id === authSessionId
    ) {
      return {
        usage_session_id: existing.usage_session_id,
        status: "active",
        started_at: existing.started_at.toISOString(),
      };
    } else {
      await closeSessionInternal(existing, lastActive, "superseded");
    }
  }

  const usageSessionId = crypto.randomUUID().replace(/-/g, "");
  const doc = new StudentUsageSession({
    student_id: studentId,
    organisation_id: orgId,
    auth_session_id: authSessionId,
    usage_session_id: usageSessionId,
    connection_id: connectionId,
    correlation_id: correlationId,
    status: "active",
    started_at: now,
    last_active_at: now,
    ended_at: null,
    duration_seconds: 0,
    end_reason: null,
  });

  try {
    await doc.save();
    return {
      usage_session_id: usageSessionId,
      status: "active",
      started_at: now.toISOString(),
    };
  } catch (err) {
    const activeRace = await StudentUsageSession.findOne({
      student_id: studentId,
      organisation_id: orgId,
      status: "active",
    });
    if (activeRace && activeRace.connection_id === connectionId) {
      return {
        usage_session_id: activeRace.usage_session_id,
        status: "active",
        started_at: activeRace.started_at.toISOString(),
      };
    }
    throw err;
  }
};

export const recordUsageKeepAlive = async ({
  studentId,
  orgId,
  authSessionId,
  usageSessionId,
  connectionId,
  jwtExp,
}) => {
  const now = new Date();
  if (jwtExp && Math.floor(now.getTime() / 1000) >= jwtExp) {
    return false;
  }

  const session = await StudentUsageSession.findOne({
    usage_session_id: usageSessionId,
    student_id: studentId,
    organisation_id: orgId,
    auth_session_id: authSessionId,
    connection_id: connectionId,
    status: "active",
  });

  if (!session) return false;

  const lastActive = session.last_active_at || session.started_at;
  const gap = (now.getTime() - new Date(lastActive).getTime()) / 1000;

  if (gap > STALE_TIMEOUT_SECONDS) {
    await closeSessionInternal(session, lastActive, "stale_timeout");
    return false;
  }

  if (gap >= PERSISTENCE_THROTTLE_SECONDS) {
    const startedAt = new Date(session.started_at);
    const effectiveDuration = Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000));
    session.last_active_at = now;
    session.duration_seconds = effectiveDuration;
    await session.save();
  }

  return true;
};

export const endUsageSession = async ({
  studentId,
  orgId,
  usageSessionId,
  connectionId,
  reason = "app_background",
  jwtExp,
}) => {
  const now = new Date();
  const cleanReason = ALLOWED_END_REASONS.has(reason) ? reason : "app_background";

  const session = await StudentUsageSession.findOne({
    usage_session_id: usageSessionId,
    student_id: studentId,
    organisation_id: orgId,
    connection_id: connectionId,
  });

  if (!session) throw new ApiError(404, "Session not found.");
  if (session.status === "inactive") {
    const dur = session.duration_seconds || 0;
    return {
      usage_session_id: usageSessionId,
      status: "inactive",
      duration_seconds: dur,
      duration_minutes: Math.floor(dur / 60),
      formatted_time: formatDuration(dur),
    };
  }

  const lastActive = new Date(session.last_active_at || session.started_at);
  const timeSinceLastActive = (now.getTime() - lastActive.getTime()) / 1000;
  let effectiveEnd =
    timeSinceLastActive <= GRACE_PERIOD_SECONDS
      ? now
      : new Date(lastActive.getTime() + GRACE_PERIOD_SECONDS * 1000);

  if (jwtExp) {
    const jwtExpiryDate = new Date(jwtExp * 1000);
    if (effectiveEnd > jwtExpiryDate) effectiveEnd = jwtExpiryDate;
  }

  return await closeSessionInternal(session, effectiveEnd, cleanReason);
};

export const handleSocketDisconnect = async (studentId, orgId, connectionId) => {
  const session = await StudentUsageSession.findOne({
    student_id: studentId,
    organisation_id: orgId,
    connection_id: connectionId,
    status: "active",
  });
  if (session) {
    const lastActive = session.last_active_at || session.started_at;
    await closeSessionInternal(session, lastActive, "socket_disconnect");
  }
};

const closeSessionInternal = async (session, endedAt, endReason) => {
  const startedAt = new Date(session.started_at);
  const endedAtDate = new Date(endedAt);
  const finalDuration = Math.max(0, Math.floor((endedAtDate.getTime() - startedAt.getTime()) / 1000));

  session.status = "inactive";
  session.ended_at = endedAtDate;
  session.duration_seconds = finalDuration;
  session.end_reason = endReason;
  await session.save();

  return {
    usage_session_id: session.usage_session_id,
    status: "inactive",
    duration_seconds: finalDuration,
    duration_minutes: Math.floor(finalDuration / 60),
    formatted_time: formatDuration(finalDuration),
  };
};

export const getStudentUsageSummary = async (req, res) => {
  const student = req.current_student;
  const studentId = student._id;
  const orgId = String(student.organisation_id || "");
  const tzName = req.query.timezone || "Asia/Kolkata";

  const now = new Date();
  // Compute target timezone dates using Intl
  const calendarDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // Format YYYY-MM-DD in target timezone
    const dateStr = d.toLocaleDateString("en-CA", { timeZone: tzName });
    if (!calendarDays.includes(dateStr)) {
      calendarDays.push(dateStr);
    }
  }

  // Ensure exactly 7 unique days
  while (calendarDays.length < 7) {
    const oldest = new Date(calendarDays[0]);
    oldest.setDate(oldest.getDate() - 1);
    calendarDays.unshift(oldest.toISOString().split("T")[0]);
  }
  if (calendarDays.length > 7) {
    calendarDays.splice(0, calendarDays.length - 7);
  }

  const periodStart = new Date(`${calendarDays[0]}T00:00:00.000Z`);
  const periodEnd = new Date(`${calendarDays[calendarDays.length - 1]}T23:59:59.999Z`);

  const sessions = await StudentUsageSession.find({
    student_id: studentId,
    organisation_id: orgId,
    started_at: { $lte: periodEnd },
    $or: [{ ended_at: { $gte: periodStart } }, { status: "active" }],
  });

  const dailySeconds = {};
  const dailySessionIds = {};
  calendarDays.forEach((d) => {
    dailySeconds[d] = 0;
    dailySessionIds[d] = new Set();
  });
  const weeklySessionIds = new Set();

  for (const session of sessions) {
    const sId = session.usage_session_id;
    const startUtc = new Date(session.started_at);
    let endUtc;
    if (session.status === "active") {
      const lastAct = session.last_active_at ? new Date(session.last_active_at) : startUtc;
      endUtc = now < lastAct ? now : lastAct;
    } else {
      endUtc = session.ended_at ? new Date(session.ended_at) : (session.last_active_at ? new Date(session.last_active_at) : startUtc);
    }

    if (endUtc <= startUtc) continue;

    for (const dayStr of calendarDays) {
      const dayStart = new Date(`${dayStr}T00:00:00.000Z`);
      const dayEnd = new Date(`${dayStr}T23:59:59.999Z`);

      const overlapStart = startUtc > dayStart ? startUtc : dayStart;
      const overlapEnd = endUtc < dayEnd ? endUtc : dayEnd;

      if (overlapEnd > overlapStart) {
        const overlapSec = Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / 1000);
        dailySeconds[dayStr] = (dailySeconds[dayStr] || 0) + overlapSec;
        dailySessionIds[dayStr].add(sId);
        weeklySessionIds.add(sId);
      }
    }
  }

  const todayStr = now.toLocaleDateString("en-CA", { timeZone: tzName });
  const weeklyTotalSeconds = Object.values(dailySeconds).reduce((a, b) => a + b, 0);
  const dailyAverageSeconds = Math.floor(weeklyTotalSeconds / 7);

  const dailyUsage = calendarDays.map((dayStr) => {
    const sec = dailySeconds[dayStr] || 0;
    const dObj = new Date(`${dayStr}T12:00:00Z`);
    const dayName = dObj.toLocaleDateString("en-US", { weekday: "long", timeZone: tzName });
    const dayShort = dObj.toLocaleDateString("en-US", { weekday: "short", timeZone: tzName });
    return {
      date: dayStr,
      day: dayName,
      day_short: dayShort,
      total_seconds: sec,
      total_minutes: Math.floor(sec / 60),
      formatted_time: formatDuration(sec),
      session_count: dailySessionIds[dayStr] ? dailySessionIds[dayStr].size : 0,
      is_today: dayStr === todayStr,
    };
  });

  const todaySec = dailySeconds[todayStr] || 0;

  const data = {
    timezone: tzName,
    period_start: `${calendarDays[0]}T00:00:00`,
    period_end: `${calendarDays[calendarDays.length - 1]}T23:59:59`,
    daily_average_seconds: dailyAverageSeconds,
    daily_average_minutes: Math.floor(dailyAverageSeconds / 60),
    daily_average_formatted: formatDuration(dailyAverageSeconds),
    weekly_total_seconds: weeklyTotalSeconds,
    weekly_total_minutes: Math.floor(weeklyTotalSeconds / 60),
    weekly_total_formatted: formatDuration(weeklyTotalSeconds),
    today_total_seconds: todaySec,
    today_total_minutes: Math.floor(todaySec / 60),
    today_total_formatted: formatDuration(todaySec),
    today_session_count: dailySessionIds[todayStr] ? dailySessionIds[todayStr].size : 0,
    weekly_session_count: weeklySessionIds.size,
    daily_usage: dailyUsage,
  };

  return res.status(200).json(new ApiResponse("Student usage analytics retrieved successfully", data));
};

export default {
  startUsageSession,
  recordUsageKeepAlive,
  endUsageSession,
  handleSocketDisconnect,
  getStudentUsageSummary,
};
