import mongoose from "mongoose";

const organisationAdminSchema = new mongoose.Schema(
  {
    organisation_admin_id: { type: String, index: true },
    organisation_id: { type: String, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    hashed_password: { type: String, required: true },
    organisation_name: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    source: { type: String, default: "super_admin" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "organisation_admins",
  }
);

export const OrganisationAdmin = mongoose.model(
  "OrganisationAdmin",
  organisationAdminSchema
);
export default OrganisationAdmin;
