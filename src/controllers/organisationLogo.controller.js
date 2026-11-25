import ApiError from "../utils/ApiError.js";
import cloudinary from "../config/cloudinary.js";
import { OrganisationLogo } from "../models/OrganisationLogo.model.js";

const uploadToCloudinary = (fileBuffer, folder = "organisation_logos") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const addLogo = async (file, logoName, currentAdmin) => {
  if (!file) {
    throw new ApiError(400, "Logo image file is required.");
  }
  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const existing = await OrganisationLogo.findOne({ organisation_id: orgId });
  if (existing) {
    throw new ApiError(409, "Logo already exists for this organisation. Use update endpoint.");
  }

  const uploadRes = await uploadToCloudinary(file.buffer);

  const doc = await OrganisationLogo.create({
    organisation_id: orgId,
    organisation_admin_id: String(adminId),
    logo_url: uploadRes.secure_url,
    public_id: uploadRes.public_id,
    logo_name: logoName || file.originalname,
    created_by: adminId,
  });

  return {
    success: true,
    message: "Logo uploaded successfully.",
    data: {
      organisation_name: currentAdmin.organisation_name,
      logo_name: doc.logo_name,
      logo_url: doc.logo_url,
      created_by: String(doc.created_by),
    },
  };
};

export const updateLogo = async (file, logoName, currentAdmin) => {
  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  let doc = await OrganisationLogo.findOne({ organisation_id: orgId });
  if (!doc) {
    throw new ApiError(404, "Logo not found. Please upload a logo first.");
  }

  if (file) {
    if (doc.public_id) {
      try {
        await cloudinary.uploader.destroy(doc.public_id);
      } catch (err) {
        console.warn("Failed to delete old logo from Cloudinary:", err.message);
      }
    }
    const uploadRes = await uploadToCloudinary(file.buffer);
    doc.logo_url = uploadRes.secure_url;
    doc.public_id = uploadRes.public_id;
  }

  if (logoName) {
    doc.logo_name = logoName;
  }

  await doc.save();

  return {
    success: true,
    message: "Logo updated successfully.",
    data: {
      organisation_name: currentAdmin.organisation_name,
      logo_name: doc.logo_name,
      logo_url: doc.logo_url,
      created_by: String(doc.created_by),
    },
  };
};

export const getLogo = async (currentAdmin) => {
  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const doc = await OrganisationLogo.findOne({ organisation_id: orgId });
  if (!doc) {
    throw new ApiError(404, "Logo not found for this organisation.");
  }

  return {
    success: true,
    message: "Logo fetched successfully.",
    data: {
      organisation_name: currentAdmin.organisation_name,
      logo_name: doc.logo_name,
      logo_url: doc.logo_url,
      created_by: String(doc.created_by),
    },
  };
};

export const deleteLogo = async (currentAdmin) => {
  const adminId = currentAdmin._id;
  const orgId = String(currentAdmin.organisation_id || adminId);

  const doc = await OrganisationLogo.findOne({ organisation_id: orgId });
  if (!doc) {
    throw new ApiError(404, "Logo not found.");
  }

  if (doc.public_id) {
    try {
      await cloudinary.uploader.destroy(doc.public_id);
    } catch (err) {
      console.warn("Failed to delete logo from Cloudinary:", err.message);
    }
  }

  await OrganisationLogo.deleteOne({ _id: doc._id });

  return {
    success: true,
    message: "Logo deleted successfully.",
  };
};

export const getStudentLogo = async (currentStudent) => {
  const orgId = String(currentStudent.organisation_id || "");
  const doc = await OrganisationLogo.findOne({ organisation_id: orgId });
  if (!doc) {
    throw new ApiError(404, "Logo not found for your organisation.");
  }

  return {
    success: true,
    message: "Logo fetched successfully.",
    data: {
      organisation_name: currentStudent.organisation_name || "",
      logo_name: doc.logo_name,
      logo_url: doc.logo_url,
      created_by: String(doc.created_by),
    },
  };
};

export const addLogoController = async (req, res) => {
  const result = await addLogo(
    req.file,
    req.body.logo_name,
    req.current_admin
  );
  return res.status(200).json(result);
};

export const updateLogoController = async (req, res) => {
  const result = await updateLogo(
    req.file,
    req.body.logo_name,
    req.current_admin
  );
  return res.status(200).json(result);
};

export const getLogoController = async (req, res) => {
  const result = await getLogo(req.current_admin);
  return res.status(200).json(result);
};

export const deleteLogoController = async (req, res) => {
  const result = await deleteLogo(req.current_admin);
  return res.status(200).json(result);
};

export const getStudentLogoController = async (req, res) => {
  const result = await getStudentLogo(req.current_student);
  return res.status(200).json(result);
};
