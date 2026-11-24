import mongoose from "mongoose";
import config from "./config.js";

export let superadminConnection = null;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI, {
      dbName: config.ORGANISATIONADMIN_DB_NAME,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`Organisation Admin MongoDB Connected: ${conn.connection.host} (${config.ORGANISATIONADMIN_DB_NAME})`);

    // Super Admin connection
    try {
      superadminConnection = mongoose.createConnection(config.SUPERADMIN_MONGO_URI, {
        dbName: config.SUPERADMIN_DB_NAME,
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`Super Admin MongoDB Connected: ${config.SUPERADMIN_DB_NAME}`);
    } catch (err) {
      console.warn("Could not connect to Super Admin MongoDB:", err.message);
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
