import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiOptions,
} from "cloudinary";

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
  version: number;
  asset_id: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  resource_type?: "image" | "video" | "raw" | "auto";
  type?: "upload" | "private" | "authenticated";
  access_mode?: "public" | "authenticated";
  use_filename?: boolean;
  unique_filename?: boolean;
  overwrite?: boolean;
  tags?: string[];
  format?: string;
}

/**
 * Upload file to Cloudinary - Simplified according to documentation
 * @param file - File path, buffer, base64 string, or remote URL
 * @param options - Upload options
 * @returns Promise with upload result
 */
export async function uploadToCloudinary(
  file: string | Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<UploadResult> {
  try {
    // Set sensible defaults based on Cloudinary documentation
    const uploadOptions: UploadApiOptions = {
      folder: options.folder || "sih-reg",
      resource_type: options.resource_type || "auto", // auto-detect is recommended
      use_filename: options.use_filename ?? false,
      unique_filename: options.unique_filename ?? true,
      overwrite: options.overwrite ?? true, // Default true as per docs
      ...options,
    };

    console.log("Cloudinary upload options:", uploadOptions);

    // Convert tags array to comma-separated string if provided
    if (options.tags && Array.isArray(options.tags)) {
      uploadOptions.tags = options.tags.join(",");
    }

    let result: UploadApiResponse;

    // Use upload_stream for buffers, direct upload for everything else
    if (Buffer.isBuffer(file)) {
      console.log(`Uploading buffer of size: ${file.length} bytes`);
      result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error("Upload stream error:", error);
              reject(error);
            } else if (result) {
              console.log("Upload stream success:", {
                public_id: result.public_id,
                secure_url: result.secure_url,
                resource_type: result.resource_type,
                format: result.format,
              });
              resolve(result);
            } else {
              reject(new Error("Upload failed - no result returned"));
            }
          }
        );
        uploadStream.end(file);
      });
    } else {
      // For strings (file paths, URLs, base64), use direct upload
      console.log(
        "Uploading string/URL:",
        typeof file === "string" ? file.substring(0, 100) + "..." : file
      );
      result = await cloudinary.uploader.upload(file, uploadOptions);
    }

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
      version: result.version,
      asset_id: result.asset_id,
    };
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);

    const err = error as { http_code?: number; message?: string };
    // Provide more specific error messages
    if (err.http_code === 400) {
      throw new Error(`Invalid upload parameters: ${err.message}`);
    } else if (err.http_code === 401) {
      throw new Error(
        "Cloudinary authentication failed - check your credentials"
      );
    } else if (err.http_code === 403) {
      throw new Error("Cloudinary upload forbidden - check your permissions");
    } else {
      throw new Error(
        `Cloudinary upload failed: ${err.message || "Unknown error"}`
      );
    }
  }
}

export default cloudinary;
