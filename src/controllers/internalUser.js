import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.js";
import { normalizePhone } from "./studentAuth.js";

export const syncCandidateOtp = async (req, res) => {
  const { candidate_id, organisation_id, phone, otp, otp_expires_at } = req.body;

  if (!mongoose.Types.ObjectId.isValid(candidate_id)) {
    throw new ApiError(400, "Invalid candidate ID.");
  }
  if (!mongoose.Types.ObjectId.isValid(organisation_id)) {
    throw new ApiError(400, "Invalid organisation ID.");
  }

  const expiresAt = new Date(otp_expires_at);
  if (expiresAt <= new Date()) {
    throw new ApiError(400, "OTP expiry must be in the future.");
  }

  const { phone_variants } = normalizePhone(phone);

  const result = await User.updateOne(
    {
      _id: candidate_id,
      phone: { $in: phone_variants },
      role: "student",
      organisation_id: String(organisation_id),
    },
    {
      $set: {
        otp,
        otp_expires_at: expiresAt,
      },
    }
  );

  if (result.matchedCount !== 1) {
    throw new ApiError(
      404,
      "Matching candidate record was not found in Organisation Admin DB."
    );
  }

  return res.status(200).json(new ApiResponse("Candidate OTP synchronized successfully."));
};
