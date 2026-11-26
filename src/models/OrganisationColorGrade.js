import mongoose from "mongoose";

const organisationColorGradeSchema = new mongoose.Schema(
  {
    organisation_id: { type: String, required: true, unique: true },
    organisation_admin_id: { type: String, index: true },
    color_grade: { type: String, required: true },
    created_by: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "organisation_color_grades",
  }
);

export const OrganisationColorGrade = mongoose.model(
  "OrganisationColorGrade",
  organisationColorGradeSchema
);
export default OrganisationColorGrade;
