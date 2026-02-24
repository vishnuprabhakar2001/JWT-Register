class ApiError extends Error {
  constructor(statusCode = 400, message = "Error") {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ApiError;
