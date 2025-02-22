import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "uploadassestsfromjobportal",
  api_key: "643758432313187",
  api_secret: "tnzdYxgIpUdLgPLCFvMcGrvwb7E",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "chatapp/avatars",
      resource_type: "auto",
    });

    // console.log("Cloudinary Upload Success:", response);

    // Delete file after upload
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("Cloudinary Upload Failed:", error);

    // Remove temporary file
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
