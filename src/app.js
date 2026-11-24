import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import errorHandler from "./middlewares/errorHandler.js";

// Routes
import userRoutes from "./routes/user.routes.js";
import organisationAdminRoutes from "./routes/organisationAdmin.routes.js";
import organisationSubadminRoutes from "./routes/organisationSubadmin.routes.js";
import gradesRoutes from "./routes/grades.routes.js";
import subjectsRoutes from "./routes/subjects.routes.js";
import organisationColorGradeRoutes from "./routes/organisationColorGrade.routes.js";
import studentColorGradeRoutes from "./routes/studentColorGrade.routes.js";
import organisationLogoRoutes from "./routes/organisationLogo.routes.js";
import studentLogoRoutes from "./routes/studentLogo.routes.js";
import bulkCandidateUploadRoutes from "./routes/bulkCandidateUpload.routes.js";
import organisationDocumentRoutes from "./routes/organisationDocument.routes.js";
import organisationTestRoutes from "./routes/organisationTest.routes.js";
import authRoutes from "./routes/auth.routes.js";
import internalUserRoutes from "./routes/internalUser.routes.js";
import assignedTestRoutes from "./routes/assignedTest.routes.js";
import studentAssignedTestRoutes from "./routes/studentAssignedTest.routes.js";
import studentTestAttemptRoutes from "./routes/studentTestAttempt.routes.js";
import organisationTestResultRoutes from "./routes/organisationTestResult.routes.js";
import reelsRoutes from "./routes/reels.routes.js";
import studentReelRoutes from "./routes/studentReel.routes.js";
import materialRoutes from "./routes/material.routes.js";
import studentMaterialRoutes from "./routes/studentMaterial.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import documentChatRoutes from "./routes/documentChat.routes.js";
import organisationDashboardRoutes from "./routes/organisationDashboard.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

// --------------------------------------------------
// CORS
// --------------------------------------------------
const allowAll = config.CORS_ORIGINS === "*" || config.CORS_ORIGINS.includes("*");
app.use(
  cors({
    origin: allowAll
      ? (origin, cb) => cb(null, true)
      : config.CORS_ORIGINS.split(",").map((s) => s.trim()),
    credentials: true,
  })
);

// --------------------------------------------------
// Body Parsers
// --------------------------------------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// --------------------------------------------------
// Response Time Header (Matching FastAPI)
// --------------------------------------------------
app.use((req, res, next) => {
  const start = performance.now();
  const originalSend = res.send;
  res.send = function (...args) {
    const duration = performance.now() - start;
    if (!res.headersSent) {
      res.setHeader("X-Process-Time", `${duration.toFixed(2)} ms`);
    }
    return originalSend.apply(this, args);
  };
  next();
});

// --------------------------------------------------
// Root & Health
// --------------------------------------------------
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Organisation Admin API is running",
    data: null,
  });
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Application is healthy",
    data: {
      status: "ok",
    },
  });
});

// --------------------------------------------------
// API Routes
// --------------------------------------------------
app.use("/api/users", userRoutes);
app.use("/api", userRoutes);
app.use("/api/organisation-admin", organisationAdminRoutes);
app.use("/api/organisation-admin/subadmins", organisationSubadminRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/organisation-color-grade", organisationColorGradeRoutes);
app.use("/api/student/color-grade", studentColorGradeRoutes);
app.use("/api/organisation-logo", organisationLogoRoutes);
app.use("/api/student/logo", studentLogoRoutes);
app.use("/api/organisation-admin/bulk-candidate-uploads", bulkCandidateUploadRoutes);
app.use("/api/organisation-admin/documents", organisationDocumentRoutes);
app.use("/api/organisation-admin/tests", organisationTestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/organisations", internalUserRoutes);
app.use("/api/organisation-admin/assigned-tests", assignedTestRoutes);
app.use("/api/student/assigned-tests", studentAssignedTestRoutes);
app.use("/api/student", studentTestAttemptRoutes);
app.use("/api/organisation-admin/test-results", organisationTestResultRoutes);
app.use("/api/reels", reelsRoutes);
app.use("/api/student/reels", studentReelRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/student/materials", studentMaterialRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/chat", chatRoutes);
app.use("", documentChatRoutes); // /getChatdocument, /createChatSessions, etc.
app.use("/api/organisation-admin", organisationDashboardRoutes);
app.use("/api/notifications", notificationRoutes);

// --------------------------------------------------
// Global Error Handler
// --------------------------------------------------
app.use(errorHandler);

export default app;
