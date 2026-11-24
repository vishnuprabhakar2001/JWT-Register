import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    material_title: { type: String, required: true },
    file_name: { type: String, required: true },
    file_path: { type: String, required: true },
    file_size: { type: String, default: "" },
    file_size_bytes: { type: Number, default: 0 },
    mime_type: { type: String, default: "" },
    organisation_admin_id: { type: String, required: true, index: true },
    organisation_id: { type: String, required: true, index: true },
    created_by: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "materials",
  }
);

materialSchema.index({ organisation_admin_id: 1, created_at: -1 });

export const Material = mongoose.model("Material", materialSchema);
export default Material;
