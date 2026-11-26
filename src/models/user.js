import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    f_name: { type: String, default: "" },
    l_name: { type: String, default: "" },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    password: { type: String, default: null },
    hashed_password: { type: String, default: null },
    phone: { type: String, default: "", index: true },
    address: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    role: { type: String, default: "student", index: true },
    status: { type: String, default: "active", index: true },
    type: { type: String, default: "organisation" },
    organisation_admin_id: { type: String, index: true },
    organisation_id: { type: String, index: true },
    grade_id: { type: String, index: true },
    grade: { type: String, default: "" },
    section: { type: String, default: "" },
    file_id: { type: String, default: "" },
    source_upload_id: { type: String, default: "" },
    source: { type: String, default: "organisation_bulk_upload" },
    created_by: { type: mongoose.Schema.Types.Mixed },
    created_by_name: { type: String, default: "" },

    // OTP and auth
    otp: { type: String, default: null },
    otp_expires_at: { type: Date, default: null },
    otp_verified_at: { type: Date, default: null },
    fcm_token: { type: String, default: null },
    fcm_token_updated_at: { type: Date, default: null },
    active_session_id: { type: String, default: null },
    current_token_sid: { type: String, default: null },
    token_issued_at: { type: Date, default: null },
    token_family: { type: String, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "users",
  }
);

userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model("User", userSchema);
export default User;
