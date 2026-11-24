import ApiError from "./ApiError.js";
import { superadminConnection } from "../config/db.js";

export const SUPERADMIN_ACTIVE_STATUS = "active";
export const ORGANISATION_NOT_ACTIVE_MESSAGE =
  "Your organisation is not active. Please contact the Super Admin.";

export const ensureSuperadminOrganisationActive = async (admin) => {
  if (!superadminConnection) {
    return;
  }
  try {
    const orgCollection = superadminConnection.collection("organisations");
    const query = {
      $or: [
        { _id: admin._id },
        { email: admin.email?.toLowerCase?.() },
        { email_normalized: admin.email?.toLowerCase?.() },
      ],
    };

    const org = await orgCollection.findOne(query);
    if (!org) {
      throw new ApiError(403, ORGANISATION_NOT_ACTIVE_MESSAGE);
    }

    if (org.status !== SUPERADMIN_ACTIVE_STATUS) {
      throw new ApiError(403, ORGANISATION_NOT_ACTIVE_MESSAGE);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // If DB is offline or table missing, log warning
    console.warn("Could not verify Super Admin organisation status:", error.message);
  }
};
