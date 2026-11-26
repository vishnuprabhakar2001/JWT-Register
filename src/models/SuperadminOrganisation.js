import mongoose from "mongoose";
import { superadminConnection } from "../config/db.js";

const superadminOrganisationSchema = new mongoose.Schema(
  {
    organisation_name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    email_normalized: { type: String, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    status: { type: String, default: "active" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "organisations",
  }
);

export const getSuperadminOrganisationModel = () => {
  if (!superadminConnection) return null;
  if (superadminConnection.models.SuperadminOrganisation) {
    return superadminConnection.models.SuperadminOrganisation;
  }
  return superadminConnection.model(
    "SuperadminOrganisation",
    superadminOrganisationSchema
  );
};

export default getSuperadminOrganisationModel;
