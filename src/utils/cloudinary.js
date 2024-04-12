import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_CLOUD_KEY, 
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        // Asynchronously delete the local temporary file
        fs.unlinkSync(localFilePath, (err) => {

            //if error this might be the error remove sync
            if (err) {
                console.error("Error deleting local file:", err);
            } else {
                console.log("Local file deleted successfully:", localFilePath);
            }
        });
        return response;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);

        // Remove the locally saved temporary file as the upload operation failed
        // fs.unlink(localFilePath, (err) => {
        //     if (err) {
        //         console.error("Error deleting local file:", err);
        //     } else {
        //         console.log("Local file deleted successfully:", localFilePath);
        //     }
        // });

        return null;
    }
};




export default uploadOnCloudinary