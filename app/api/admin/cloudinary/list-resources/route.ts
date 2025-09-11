import { NextResponse } from "next/server";
import cloudinary from "@/lib/utils/cloudinary";

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  format: string;
  access_mode?: string;
}

export async function GET() {
  try {
    // List all resources to see what we have
    const resources = await cloudinary.api.resources({
      max_results: 100,
      resource_type: "raw", // Check raw resources first
    });

    const imageResources = await cloudinary.api.resources({
      max_results: 100,
      resource_type: "image",
    });

    return NextResponse.json({
      success: true,
      raw_resources: resources.resources.map((r: CloudinaryResource) => ({
        public_id: r.public_id,
        secure_url: r.secure_url,
        resource_type: "raw",
        format: r.format,
        access_mode: r.access_mode,
      })),
      image_resources: imageResources.resources.map(
        (r: CloudinaryResource) => ({
          public_id: r.public_id,
          secure_url: r.secure_url,
          resource_type: "image",
          format: r.format,
          access_mode: r.access_mode,
        })
      ),
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error listing Cloudinary resources:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
