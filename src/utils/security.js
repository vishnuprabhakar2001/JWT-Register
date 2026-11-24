import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const verifyPassword = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) return false;
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch {
    return false;
  }
};

export const createAccessToken = (adminId) => {
  const now = Math.floor(Date.now() / 1000);
  const expiresInSeconds = config.JWT_EXPIRY_MINUTES * 60;
  return jwt.sign(
    {
      sub: String(adminId),
      iat: now,
      exp: now + expiresInSeconds,
    },
    config.JWT_SECRET,
    { algorithm: config.JWT_ALGORITHM || "HS256" }
  );
};

export const createSubadminAccessToken = (subadminId) => {
  const now = Math.floor(Date.now() / 1000);
  const expiresInSeconds = config.JWT_EXPIRY_MINUTES * 60;
  return jwt.sign(
    {
      sub: String(subadminId),
      actor_role: "organisation_subadmin",
      iat: now,
      exp: now + expiresInSeconds,
    },
    config.JWT_SECRET,
    { algorithm: config.JWT_ALGORITHM || "HS256" }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET, {
    algorithms: [config.JWT_ALGORITHM || "HS256"],
  });
};
