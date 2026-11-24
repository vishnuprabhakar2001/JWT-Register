import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import config from "../config/config.js";

const JWT_SECRET = config.JWT_SECRET || process.env.JWT_SECRET || "reckomate_jwt_secret";

const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.hashed_password;
  delete userObj.otp;
  return userObj;
};

// POST /register
export const registerUser = asyncHandler(async (req, res) => {
  const { f_name, l_name, name, email, phone, password, address } = req.body;

  const fullName = name || [f_name, l_name].filter(Boolean).join(" ") || "User";
  const normalizedEmail = email ? String(email).trim().toLowerCase() : null;

  if (!normalizedEmail && !phone) {
    throw new ApiError(400, "Email or phone number is required.");
  }

  if (normalizedEmail) {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ApiError(400, "User already exists with this email.");
    }
  }

  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const user = await User.create({
    name: fullName,
    f_name: f_name || "",
    l_name: l_name || "",
    email: normalizedEmail,
    phone: phone || "",
    password: hashedPassword,
    hashed_password: hashedPassword,
    address: address || "",
    status: "active",
    role: "student",
  });

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(201).json(
    new ApiResponse("User registered successfully", {
      user: sanitizeUser(user),
      token,
    })
  );
});

// POST /login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    throw new ApiError(400, "Email/phone and password are required.");
  }

  const query = {};
  if (email) {
    query.email = String(email).trim().toLowerCase();
  } else if (phone) {
    query.phone = String(phone).trim();
  }

  const user = await User.findOne(query);
  if (!user) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const storedHash = user.password || user.hashed_password;
  if (!storedHash) {
    throw new ApiError(400, "Password not configured for this user. Please use OTP or reset password.");
  }

  const isMatch = await bcrypt.compare(password, storedHash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(200).json(
    new ApiResponse("Login successful", {
      user: sanitizeUser(user),
      token,
    })
  );
});

// PATCH /update
export const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id || req.body?.userId;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Valid User ID is required.");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const { f_name, l_name, name, email, phone, address, profileImage } = req.body;

  if (f_name !== undefined) user.f_name = f_name;
  if (l_name !== undefined) user.l_name = l_name;
  if (name !== undefined) {
    user.name = name;
  } else if (f_name !== undefined || l_name !== undefined) {
    user.name = [user.f_name, user.l_name].filter(Boolean).join(" ");
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
    if (existing) {
      throw new ApiError(400, "Email is already taken by another user.");
    }
    user.email = normalizedEmail;
  }

  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (profileImage !== undefined) user.profileImage = profileImage;

  await user.save();

  return res.status(200).json(
    new ApiResponse("User updated successfully", sanitizeUser(user))
  );
});

// GET /getallusers
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -hashed_password -otp");
  return res.status(200).json(
    new ApiResponse("Users fetched successfully", users)
  );
});

// GET /getuser/:id
export const getuserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  const user = await User.findById(id).select("-password -hashed_password -otp");
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return res.status(200).json(
    new ApiResponse("User fetched successfully", user)
  );
});
