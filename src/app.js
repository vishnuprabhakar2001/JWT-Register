import express from "express";
// import cookieParser from "cookie-parser";
import userRoutes from "./routes/routes.js";

const app = express();

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// Routes
app.use("/api", userRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  return res.status(400).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

export default app;
