import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
}

/**
 * Upload file to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Folder to upload to in Cloudinary
 * @param resourceType - Type of resource (image, video, raw, auto)
 * @param filename - Original filename (optional)
 * @returns Promise with upload result
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = "sih-reg",
  resourceType: "image" | "video" | "raw" | "auto" = "auto",
  filename?: string
): Promise<UploadResult> {
  try {
    let result: UploadApiResponse;

    if (Buffer.isBuffer(file)) {
      // For Buffer uploads, use the stream upload method
      result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
            use_filename: filename ? true : false,
            filename_override: filename ? filename.split('.')[0] : undefined, // Remove extension, Cloudinary will auto-detect
            unique_filename: true,
            overwrite: false,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result);
            } else {
              reject(new Error("Upload failed - no result"));
            }
          }
        );
        
        // Write the buffer to the stream
        uploadStream.end(file);
      });
    } else {
      // For string (file path), upload directly
      result = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
      });
    }

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
}

/**
 * Delete file from Cloudinary
 * @param publicId - Public ID of the file to delete
 * @param resourceType - Type of resource
 * @returns Promise with deletion result
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "raw"
): Promise<{ result: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete file from Cloudinary");
  }
}

/**
 * Generate a signed upload URL for direct uploads
 * @param folder - Folder to upload to
 * @param resourceType - Type of resource
 * @returns Signed upload parameters
 */
export function generateSignedUploadUrl(
  folder: string = "sih-reg",
  resourceType: "image" | "video" | "raw" | "auto" = "auto"
) {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
      resource_type: resourceType,
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    resource_type: resourceType,
  };
}

export default cloudinary;
