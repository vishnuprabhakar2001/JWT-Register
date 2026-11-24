import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || "8000", 10),

  // MongoDB
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017",
  ORGANISATIONADMIN_DB_NAME:
    process.env.ORGANISATIONADMIN_DB_NAME || "OrganisationAdmin_database",

  // Super Admin MongoDB
  SUPERADMIN_MODE: process.env.SUPERADMIN_MODE || "local",
  SUPERADMIN_MONGO_URI:
    process.env.SUPERADMIN_MONGO_URI ||
    process.env.MONGO_URI ||
    "mongodb://localhost:27017",
  SUPERADMIN_DB_NAME: process.env.SUPERADMIN_DB_NAME || "SuperAdmin_database",
  SUPERADMIN_API_URL: process.env.SUPERADMIN_API_URL || "",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "supersecretkey",
  JWT_ALGORITHM: process.env.JWT_ALGORITHM || "HS256",
  JWT_EXPIRY_MINUTES: parseInt(process.env.JWT_EXPIRY_MINUTES || "1080", 10),
  ORG_REFRESH_TOKEN_EXPIRE_DAYS: parseInt(
    process.env.ORG_REFRESH_TOKEN_EXPIRE_DAYS || "7",
    10
  ),

  // Student Auth
  OTP_SYNC_SECRET: process.env.OTP_SYNC_SECRET || "",
  ACCESS_TOKEN_EXPIRE_MINUTES: parseInt(
    process.env.ACCESS_TOKEN_EXPIRE_MINUTES || "15",
    10
  ),
  JWT_REFRESH_SECRET_KEY:
    process.env.JWT_REFRESH_SECRET_KEY || "superrefreshsecretkey",
  REFRESH_TOKEN_EXPIRE_DAYS: parseInt(
    process.env.REFRESH_TOKEN_EXPIRE_DAYS || "7",
    10
  ),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  // Public URL
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || "",

  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS || "*",
  TEST_TIMEZONE: process.env.TEST_TIMEZONE || "UTC",

  // Email / SMTP
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "smtp",
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_USERNAME: process.env.SMTP_USERNAME || "",
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || "",
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || "",
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || "Reckomate",
  SMTP_USE_TLS: process.env.SMTP_USE_TLS !== "false",

  // Document Chat / OpenAI
  LLM_PROVIDER: process.env.LLM_PROVIDER || "openai",
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
};

export default config;
