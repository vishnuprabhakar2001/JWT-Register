import mongoose from "mongoose";

const reelSchema = new mongoose.Schema(
  {
    caption: { type: String, default: "" },
    video_url: { type: String, required: true },
    public_id: { type: String, default: "" },
    thumbnail_url: { type: String, default: "" },
    organisation_admin_id: { type: String, required: true, index: true },
    organisation_id: { type: String, required: true, index: true },
    created_by: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "reels",
  }
);

reelSchema.index({ organisation_admin_id: 1, created_at: -1 });

export const Reel = mongoose.model("Reel", reelSchema);
export default Reel;
