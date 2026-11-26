class ApiResponse {
  constructor(message = "Success", data = null, extra = null) {
    this.success = true;
    this.message = message;
    this.data = data;
    if (extra && typeof extra === "object") {
      Object.assign(this, extra);
    }
  }
}

export default ApiResponse;
