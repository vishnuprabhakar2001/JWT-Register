import mongoose from "mongoose";

const organisationSubAdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    hashed_password: { type: String, required: true },
    organisation_admin_id: { type: String, required: true, index: true },
    organisation_name: { type: String, required: true },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "organisation_subadmins",
  }
);

organisationSubAdminSchema.index(
  { organisation_admin_id: 1, email: 1 },
  { unique: true }
);

export const OrganisationSubAdmin = mongoose.model(
  "OrganisationSubAdmin",
  organisationSubAdminSchema
);
export default OrganisationSubAdmin;
