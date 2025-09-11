import { NextResponse } from "next/server";
import cloudinary from "@/lib/utils/cloudinary";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("public_id");
    const resourceType = searchParams.get("resource_type") || "image";

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: "public_id parameter is required" },
        { status: 400 }
      );
    }

    const resource = await cloudinary.api.resource(publicId, {
      resource_type: resourceType as "image" | "video" | "raw",
    });

    return NextResponse.json({
      success: true,
      resource: {
        public_id: resource.public_id,
        access_mode: resource.access_mode,
        secure_url: resource.secure_url,
        format: resource.format,
        version: resource.version,
        resource_type: resourceType,
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error checking resource access:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
