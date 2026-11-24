import asyncHandler from "../middlewares/asyncHandler.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import cloudinary from "../config/cloudinary.js";
import { Reel } from "../models/Reel.model.js";
import { SavedReel } from "../models/SavedReel.model.js";

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

export const addReel = async (file, caption, currentAdmin) => {
  if (!file) {
    throw new ApiError(400, "Reel video file is required.");
  }
  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const uploadRes = await uploadVideoToCloudinary(file.buffer);

  const newReel = await Reel.create({
    caption: caption || "",
    video_url: uploadRes.secure_url,
    public_id: uploadRes.public_id,
    thumbnail_url: uploadRes.secure_url.replace(/\.[^/.]+$/, ".jpg"),
    organisation_admin_id: String(adminId),
    organisation_id: orgId,
    created_by: adminId,
  });

  return {
    success: true,
    message: "Reel added successfully.",
    data: {
      reel_id: String(newReel._id),
      caption: newReel.caption,
      video_url: newReel.video_url,
      thumbnail_url: newReel.thumbnail_url,
      created_at: newReel.created_at,
    },
  };
};

export const getAllReels = async (currentAdmin) => {
  const adminId = String(currentAdmin._id);
  const reels = await Reel.find({ organisation_admin_id: adminId }).sort({ created_at: -1 });

  return {
    success: true,
    message: "Reels fetched successfully.",
    data: reels.map((r) => ({
      reel_id: String(r._id),
      caption: r.caption,
      video_url: r.video_url,
      thumbnail_url: r.thumbnail_url,
      created_at: r.created_at,
    })),
  };
};

export const updateReelCaption = async (reelId, caption, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(reelId)) {
    throw new ApiError(400, "Invalid Reel ID.");
  }
  const adminId = String(currentAdmin._id);
  const reel = await Reel.findOneAndUpdate(
    { _id: reelId, organisation_admin_id: adminId },
    { $set: { caption: caption || "" } },
    { new: true }
  );
  if (!reel) {
    throw new ApiError(404, "Reel not found.");
  }

  return {
    success: true,
    message: "Reel caption updated successfully.",
    data: {
      reel_id: String(reel._id),
      caption: reel.caption,
    },
  };
};

export const deleteReel = async (reelId, currentAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(reelId)) {
    throw new ApiError(400, "Invalid Reel ID.");
  }
  const adminId = String(currentAdmin._id);
  const reel = await Reel.findOne({ _id: reelId, organisation_admin_id: adminId });
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

  return {
    success: true,
    message: "Reel deleted successfully.",
  };
};

// Student APIs
export const getStudentReels = async (student) => {
  const orgId = String(student.organisation_id || "");
  const studentId = String(student._id);

  const reels = await Reel.find({ organisation_id: orgId }).sort({ created_at: -1 });
  const savedList = await SavedReel.find({ student_id: studentId });
  const savedSet = new Set(savedList.map((s) => s.reel_id));

  return {
    success: true,
    message: "Reels fetched successfully.",
    data: reels.map((r) => ({
      reel_id: String(r._id),
      caption: r.caption,
      video_url: r.video_url,
      thumbnail_url: r.thumbnail_url,
      is_saved: savedSet.has(String(r._id)),
      created_at: r.created_at,
    })),
  };
};

export const saveReelByStudent = async (reelId, student) => {
  if (!mongoose.Types.ObjectId.isValid(reelId)) {
    throw new ApiError(400, "Invalid Reel ID.");
  }
  const studentId = String(student._id);
  const reel = await Reel.findById(reelId);
  if (!reel) {
    throw new ApiError(404, "Reel not found.");
  }

  const existing = await SavedReel.findOne({ student_id: studentId, reel_id: reelId });
  if (existing) {
    await SavedReel.deleteOne({ _id: existing._id });
    return {
      success: true,
      message: "Reel unsaved successfully.",
      data: { is_saved: false },
    };
  }

  await SavedReel.create({
    student_id: studentId,
    reel_id: reelId,
  });

  return {
    success: true,
    message: "Reel saved successfully.",
    data: { is_saved: true },
  };
};

export const getStudentSavedReels = async (student) => {
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

  return {
    success: true,
    message: "Saved reels fetched successfully.",
    data: result,
  };
};

export const addReelController = asyncHandler(async (req, res) => {
  const result = await addReel(
    req.file,
    req.body.caption,
    req.current_admin
  );
  return res.status(200).json(result);
});

export const getAllReelsController = asyncHandler(async (req, res) => {
  const result = await getAllReels(req.current_admin);
  return res.status(200).json(result);
});

export const updateReelCaptionController = asyncHandler(async (req, res) => {
  const result = await updateReelCaption(
    req.params.reel_id,
    req.body.caption,
    req.current_admin
  );
  return res.status(200).json(result);
});

export const deleteReelController = asyncHandler(async (req, res) => {
  const result = await deleteReel(req.params.reel_id, req.current_admin);
  return res.status(200).json(result);
});

export const getStudentReelsController = asyncHandler(async (req, res) => {
  const result = await getStudentReels(req.current_student);
  return res.status(200).json(result);
});

export const saveReelByStudentController = asyncHandler(async (req, res) => {
  const result = await saveReelByStudent(
    req.params.reel_id,
    req.current_student
  );
  return res.status(200).json(result);
});

export const getStudentSavedReelsController = asyncHandler(async (req, res) => {
  const result = await getStudentSavedReels(req.current_student);
  return res.status(200).json(result);
});
