import mongoose from "mongoose";

const savedReelSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true, index: true },
    reel_id: { type: String, required: true, index: true },
    saved_at: { type: Date, default: Date.now, index: -1 },
  },
  {
    timestamps: false,
    collection: "saved_reels",
  }
);

savedReelSchema.index({ student_id: 1, reel_id: 1 }, { unique: true });

export const SavedReel = mongoose.model("SavedReel", savedReelSchema);
export default SavedReel;
