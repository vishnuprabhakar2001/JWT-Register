import { WebSocketServer, WebSocket } from "ws";
import url from "url";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { User } from "../models/user.js";
import { OrganisationAdmin } from "../models/OrganisationAdmin.js";
import { OrganisationSubAdmin } from "../models/OrganisationSubAdmin.js";
import { startTest, submitTest } from "../controllers/studentTestAttempt.js";
import { StudentTestAttempt } from "../models/StudentTestAttempt.js";
import { sendRoomMessage } from "../controllers/chat.js";
import { getLiveTestsOverview, getIndividualLeaderboard } from "../controllers/leaderboard.js";

// Global connection registries
const chatRoomSockets = new Map(); // roomId -> Set<ws>
const studentSessionSockets = new Map(); // studentId -> Set<{ ws, sessionId }>

export const attachWebSocketServer = (httpServer) => {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", async (request, socket, head) => {
    try {
      const parsedUrl = url.parse(request.url, true);
      const pathname = parsedUrl.pathname || "";

      // Extract token from query or header
      let token = parsedUrl.query.token || parsedUrl.query.access_token;
      if (!token && request.headers.authorization) {
        if (request.headers.authorization.startsWith("Bearer ")) {
          token = request.headers.authorization.slice(7).trim();
        }
      }

      if (!token) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      let payload;
      try {
        payload = jwt.verify(token, config.JWT_SECRET);
      } catch {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      // Identify user
      let currentUser = null;
      const userId = payload.sub;

      const student = await User.findById(userId);
      if (student && student.role === "student" && student.status === "active") {
        currentUser = {
          id: String(student._id),
          role: "student",
          name: student.name,
          email: student.email,
          organisation_id: student.organisation_id,
          grade_id: student.grade_id,
          grade: student.grade,
          section: student.section,
          sessionId: payload.sid,
        };
      } else {
        const subadmin = await OrganisationSubAdmin.findById(userId);
        if (subadmin && subadmin.is_active) {
          currentUser = {
            id: String(subadmin._id),
            role: "organisation_subadmin",
            name: subadmin.name,
            email: subadmin.email,
            organisation_id: subadmin.organisation_admin_id,
          };
        } else {
          const admin = await OrganisationAdmin.findById(userId);
          if (admin && admin.is_active) {
            currentUser = {
              id: String(admin._id),
              role: "organisation_admin",
              name: admin.name,
              email: admin.email,
              organisation_id: String(admin._id),
            };
          }
        }
      }

      if (!currentUser) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        ws.user = currentUser;
        ws.pathname = pathname;
        ws.query = parsedUrl.query;
        wss.emit("connection", ws, request);
      });
    } catch (err) {
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      socket.destroy();
    }
  });

  wss.on("connection", (ws) => {
    const { pathname, user } = ws;

    // 1. /ws/auth/session
    if (pathname === "/ws/auth/session") {
      const studentId = user.id;
      if (!studentSessionSockets.has(studentId)) {
        studentSessionSockets.set(studentId, new Set());
      }
      studentSessionSockets.get(studentId).add({ ws, sessionId: user.sessionId });

      ws.on("close", () => {
        const set = studentSessionSockets.get(studentId);
        if (set) {
          for (const item of set) {
            if (item.ws === ws) set.delete(item);
          }
          if (set.size === 0) studentSessionSockets.delete(studentId);
        }
      });
      return;
    }

    // 2. /ws/test-session
    if (pathname === "/ws/test-session") {
      ws.on("message", async (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          const event = parsed.event;
          const payload = parsed.data || {};

          if (event === "test:ping" || event === "ping") {
            ws.send(JSON.stringify({ event: "test:pong", data: { timestamp: Date.now() / 1000 } }));
          } else if (event === "test:start") {
            const result = await startTest(payload.assigned_test_id, user, payload.attempt_type || "test");
            ws.send(JSON.stringify({ event: "test:started", data: result.data }));
          } else if (event === "answer:update") {
            // Save answer progressively
            if (payload.attempt_id && payload.question_id) {
              const attempt = await StudentTestAttempt.findById(payload.attempt_id);
              if (attempt && attempt.status === "in_progress") {
                if (!attempt.answers) attempt.answers = {};
                attempt.answers[payload.question_id] = payload.answer;
                attempt.markModified("answers");
                await attempt.save();
              }
            }
            ws.send(JSON.stringify({ event: "answer:saved", data: { success: true } }));
          } else if (event === "test:submit") {
            const result = await submitTest(payload.attempt_id, { answers: payload.answers }, user);
            ws.send(JSON.stringify({ event: "test:submitted", data: result.data }));
          } else if (event === "test:timer_sync") {
            if (payload.attempt_id) {
              const attempt = await StudentTestAttempt.findById(payload.attempt_id);
              if (attempt) {
                const remaining = Math.max(0, Math.floor((new Date(attempt.deadline_at).getTime() - Date.now()) / 1000));
                ws.send(JSON.stringify({ event: "test:timer_synced", data: { remaining_seconds: remaining } }));
              }
            }
          }
        } catch (err) {
          ws.send(JSON.stringify({ event: "test:error", data: { message: err.message } }));
        }
      });
      return;
    }

    // 3. /ws/leaderboard/overview
    if (pathname === "/ws/leaderboard/overview") {
      const sendOverview = async () => {
        try {
          const result = await getLiveTestsOverview(user);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: "leaderboard:overview", data: result.data }));
          }
        } catch {}
      };
      sendOverview();
      const interval = setInterval(sendOverview, 10000);
      ws.on("close", () => clearInterval(interval));
      return;
    }

    // 4. /ws/leaderboard/:assigned_test_id
    const lbMatch = pathname.match(/^\/ws\/leaderboard\/([^/]+)$/);
    if (lbMatch) {
      const assignedTestId = lbMatch[1];
      const sendLB = async () => {
        try {
          const result = await getIndividualLeaderboard(assignedTestId, user);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: "leaderboard:update", data: result.data }));
          }
        } catch {}
      };
      sendLB();
      const interval = setInterval(sendLB, 5000);
      ws.on("close", () => clearInterval(interval));
      return;
    }

    // 5. /ws/chat/:room_id
    const chatMatch = pathname.match(/^\/ws\/chat\/([^/]+)$/);
    if (chatMatch) {
      const roomId = chatMatch[1];
      if (!chatRoomSockets.has(roomId)) {
        chatRoomSockets.set(roomId, new Set());
      }
      chatRoomSockets.get(roomId).add(ws);

      ws.on("message", async (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          const text = parsed.message || parsed.message_text;
          if (text) {
            const saved = await sendRoomMessage({
              roomId,
              currentUser: user,
              message_text: text,
              mentions: parsed.mentions,
            });

            // Broadcast to all sockets in room
            const sockets = chatRoomSockets.get(roomId);
            if (sockets) {
              const broadcastMsg = JSON.stringify({ event: "NEW_MESSAGE", data: saved });
              for (const client of sockets) {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(broadcastMsg);
                }
              }
            }
          }
        } catch (err) {
          ws.send(JSON.stringify({ event: "ERROR", message: err.message }));
        }
      });

      ws.on("close", () => {
        const sockets = chatRoomSockets.get(roomId);
        if (sockets) {
          sockets.delete(ws);
          if (sockets.size === 0) chatRoomSockets.delete(roomId);
        }
      });
      return;
    }

    ws.close(1000, "Unrecognized WebSocket path.");
  });

  return wss;
};

export const evictStudent = (studentId, preserveSessionId = null, code = 1008, reason = "LOGGED_IN_ON_ANOTHER_DEVICE") => {
  if (!studentId) return;
  const cleanId = String(studentId).trim();
  const set = studentSessionSockets.get(cleanId);
  if (set) {
    for (const item of Array.from(set)) {
      if (preserveSessionId && item.sessionId === preserveSessionId) continue;
      try {
        item.ws.close(code, reason);
      } catch {}
      set.delete(item);
    }
    if (set.size === 0) {
      studentSessionSockets.delete(cleanId);
    }
  }
};

export default attachWebSocketServer;
