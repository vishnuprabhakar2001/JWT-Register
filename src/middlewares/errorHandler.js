import ApiError from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let extraData = {};

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    if (err.extra && typeof err.extra === "object") {
      extraData = err.extra;
    }
  } else if (err.name === "ValidationError") {
    // Mongoose validation error
    statusCode = 422;
    message = "Request validation failed.";
    const errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      message,
      errors,
      data: null,
    });
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate key conflict.";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    ...extraData,
  });
};

export default errorHandler;
