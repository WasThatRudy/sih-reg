import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "../../../lib/middleware/auth";
import { uploadToCloudinary } from "../../../lib/utils/cloudinary";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    await verifyAuth(request);

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "sih-uploads";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary - simplified to use buffer directly
    const result = await uploadToCloudinary(buffer, {
      folder,
      resource_type: "auto", // Auto-detect file type
      use_filename: true,
      unique_filename: true,
    });

    return NextResponse.json({
      success: true,
      file: {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        size: result.bytes,
      },
    });
  } catch (error: unknown) {
    console.error("File upload error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
