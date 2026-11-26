import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import cloudinary from "../config/cloudinary.js";
import { Reel } from "../models/Reel.js";
import { SavedReel } from "../models/SavedReel.js";

const uploadVideoToCloudinary = (fileBuffer, folder = "reels") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "video" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const addReel = async (req, res) => {
  const { file, body, current_admin } = req;
  if (!file) {
    throw new ApiError(400, "Reel video file is required.");
  }
  const adminId = current_admin._id;
  const orgId = String(current_admin.organisation_id || adminId);

  const uploadRes = await uploadVideoToCloudinary(file.buffer);

  const newReel = await Reel.create({
    caption: body?.caption || "",
    video_url: uploadRes.secure_url,
    public_id: uploadRes.public_id,
    thumbnail_url: uploadRes.secure_url.replace(/\.[^/.]+$/, ".jpg"),
    organisation_admin_id: String(adminId),
    organisation_id: orgId,
    created_by: adminId,
  });

  const data = {
    reel_id: String(newReel._id),
    caption: newReel.caption,
    video_url: newReel.video_url,
    thumbnail_url: newReel.thumbnail_url,
    created_at: newReel.created_at,
  };

  return res.status(200).json(new ApiResponse("Reel added successfully.", data));
};

export const getAllReels = async (req, res) => {
  const adminId = String(req.current_admin._id);
  const reels = await Reel.find({ organisation_admin_id: adminId }).sort({ created_at: -1 });

  const data = reels.map((r) => ({
    reel_id: String(r._id),
    caption: r.caption,
    video_url: r.video_url,
    thumbnail_url: r.thumbnail_url,
    created_at: r.created_at,
  }));

  return res.status(200).json(new ApiResponse("Reels fetched successfully.", data));
};

export const updateReelCaption = async (req, res) => {
  const { reel_id } = req.params;
  const { caption } = req.body;

  if (!mongoose.Types.ObjectId.isValid(reel_id)) {
    throw new ApiError(400, "Invalid Reel ID.");
  }
  const adminId = String(req.current_admin._id);
  const reel = await Reel.findOneAndUpdate(
    { _id: reel_id, organisation_admin_id: adminId },
    { $set: { caption: caption || "" } },
    { new: true }
  );
  if (!reel) {
    throw new ApiError(404, "Reel not found.");
  }

  const data = {
    reel_id: String(reel._id),
    caption: reel.caption,
  };

  return res.status(200).json(new ApiResponse("Reel caption updated successfully.", data));
};

export const deleteReel = async (req, res) => {
  const { reel_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reel_id)) {
    throw new ApiError(400, "Invalid Reel ID.");
  }
  const adminId = String(req.current_admin._id);
  const reel = await Reel.findOne({ _id: reel_id, organisation_admin_id: adminId });
  if (!reel) {
    throw new ApiError(404, "Reel not found.");
  }

  if (reel.public_id) {
    try {
      await cloudinary.uploader.destroy(reel.public_id, { resource_type: "video" });
    } catch (err) {
      console.warn("Failed to delete reel from Cloudinary:", err.message);
    }
  }

  await Reel.deleteOne({ _id: reel._id });
  await SavedReel.deleteMany({ reel_id: String(reel._id) });

  return res.status(200).json(new ApiResponse("Reel deleted successfully."));
};

// Student APIs
export const getStudentReels = async (req, res) => {
  const student = req.current_student;
  const orgId = String(student.organisation_id || "");
  const studentId = String(student._id);

  const reels = await Reel.find({ organisation_id: orgId }).sort({ created_at: -1 });
  const savedList = await SavedReel.find({ student_id: studentId });
  const savedSet = new Set(savedList.map((s) => s.reel_id));

  const data = reels.map((r) => ({
    reel_id: String(r._id),
    caption: r.caption,
    video_url: r.video_url,
    thumbnail_url: r.thumbnail_url,
    is_saved: savedSet.has(String(r._id)),
    created_at: r.created_at,
  }));

  return res.status(200).json(new ApiResponse("Reels fetched successfully.", data));
};

export const saveReelByStudent = async (req, res) => {
  const { reel_id } = req.params;
  const student = req.current_student;

  if (!mongoose.Types.ObjectId.isValid(reel_id)) {
    throw new ApiError(400, "Invalid Reel ID.");
  }
  const studentId = String(student._id);
  const reel = await Reel.findById(reel_id);
  if (!reel) {
    throw new ApiError(404, "Reel not found.");
  }

  const existing = await SavedReel.findOne({ student_id: studentId, reel_id });
  if (existing) {
    await SavedReel.deleteOne({ _id: existing._id });
    return res.status(200).json(new ApiResponse("Reel unsaved successfully.", { is_saved: false }));
  }

  await SavedReel.create({
    student_id: studentId,
    reel_id,
  });

  return res.status(200).json(new ApiResponse("Reel saved successfully.", { is_saved: true }));
};

export const getStudentSavedReels = async (req, res) => {
  const student = req.current_student;
  const studentId = String(student._id);
  const saved = await SavedReel.find({ student_id: studentId }).sort({ saved_at: -1 });
  const reelIds = saved.map((s) => s.reel_id);

  const reels = await Reel.find({ _id: { $in: reelIds } });
  const reelMap = new Map(reels.map((r) => [String(r._id), r]));

  const result = [];
  for (const s of saved) {
    const r = reelMap.get(s.reel_id);
    if (r) {
      result.push({
        reel_id: String(r._id),
        caption: r.caption,
        video_url: r.video_url,
        thumbnail_url: r.thumbnail_url,
        is_saved: true,
        saved_at: s.saved_at,
      });
    }
  }

  return res.status(200).json(new ApiResponse("Saved reels fetched successfully.", result));
};
