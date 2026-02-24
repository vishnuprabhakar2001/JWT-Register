import User from "../models/user.model.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";

import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs/promises";
import path from "path";
import os from "os";

ffmpeg.setFfmpegPath(ffmpegPath);

// Registration
export const registerUser = asyncHandler(async (req, res) => {
  const { f_name, l_name, email, phone, address } = req.body;

  if (!f_name || !l_name || !email || !phone || !address) {
    throw new ApiError(400, "All fields are required");
  }

  const existUser = await User.findOne({ email: email });
  if (existUser) {
    throw new ApiError(400, "This user is already resistered.");
  }

  const user = await User.create({
    f_name,
    l_name,
    email,
    phone,
    address,
  });

  // 🔹 Generate JWT Token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return res.json(
    new ApiResponse("User registered successfully", {
      user,
      token,
    })
  );
});

// Update Profile
// Update Profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { userId, token, f_name, l_name, email, phone, address } = req.body;

  if (!userId || !token) {
    throw new ApiError(400, "UserId and Token are required");
  }

  // 🔹 Verify Token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(400, "Unauthorized request - Invalid token");
  }

  if (decoded.id !== userId) {
    throw new ApiError(400, "Unauthorized request");
  }

  const user = await User.findById(userId);
  if (!user) throw new ApiError(400, "User not found");

  if (f_name) user.f_name = f_name;
  if (l_name) user.l_name = l_name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  if (!req.file) {
    throw new ApiError(400, "Profile Image is required.");
  }

  // ✅ ORIGINAL SIZE
  const originalSizeKB = req.file.size / 1024;

  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input-${Date.now()}.jpg`);
  const outputPath = path.join(tempDir, `output-${Date.now()}.jpg`);

  // Save buffer to temp file
  await fs.writeFile(inputPath, req.file.buffer);

  let quality = 5; // start high quality
  let finalSizeKB = 0;

  // 🔁 Compress until < 100KB
  while (quality <= 31) {
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([`-q:v ${quality}`])
        .save(outputPath)
        .on("end", resolve)
        .on("error", reject);
    });

    const stats = await fs.stat(outputPath);
    finalSizeKB = stats.size / 1024;

    if (finalSizeKB <= 100) break;

    quality += 2;
  }

  const compressedBuffer = await fs.readFile(outputPath);

  // 🔹 Upload compressed image to Cloudinary
  const uploadToCloudinary = () =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(compressedBuffer);
    });

  const result = await uploadToCloudinary();
  user.profileImage = result.secure_url;

  await user.save();

  // 🧹 Delete temp files
  await fs.unlink(inputPath);
  await fs.unlink(outputPath);

  return res.json(
    new ApiResponse("Profile updated successfully", {
      user,
      originalSizeKB: originalSizeKB.toFixed(2),
      finalSizeKB: finalSizeKB.toFixed(2),
    })
  );
});

// Get Profile
export const getProfile = asyncHandler(async (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    throw new ApiError(400, "UserId and Token are required");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(400, "Unauthorized request - Invalid token");
  }

  if (decoded.id !== userId) {
    throw new ApiError(400, "Unauthorized request");
  }

  const user = await User.findById(userId);
  if (!user) throw new ApiError(400, "User not found");

  return res.json(new ApiResponse("Profile fetched successfully", user));
});
