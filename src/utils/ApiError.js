class ApiError extends Error {
  constructor(statusCode = 400, message = "Error", extra = null) {
    super(message);
    this.statusCode = statusCode;
    this.extra = extra;
  }
}

export default ApiError;
