import mongoose from "mongoose";

const organisationRefreshTokenSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true },
    family_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    actor_role: { type: String, required: true },
    is_revoked: { type: Boolean, default: false },
    expires_at: { type: Date, required: true },
    delete_at: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "organisation_refresh_tokens",
  }
);

export const OrganisationRefreshToken = mongoose.model(
  "OrganisationRefreshToken",
  organisationRefreshTokenSchema
);
export default OrganisationRefreshToken;
