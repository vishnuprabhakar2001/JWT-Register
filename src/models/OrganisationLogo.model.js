import mongoose from "mongoose";

const organisationLogoSchema = new mongoose.Schema(
  {
    organisation_id: { type: String, required: true, unique: true },
    organisation_admin_id: { type: String, index: true },
    logo_url: { type: String, required: true },
    public_id: { type: String, default: "" },
    created_by: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "organisation_logos",
  }
);

export const OrganisationLogo = mongoose.model(
  "OrganisationLogo",
  organisationLogoSchema
);
export default OrganisationLogo;
