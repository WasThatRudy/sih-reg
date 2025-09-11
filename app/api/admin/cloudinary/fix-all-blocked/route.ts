import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Team } from "@/models/Team";
import cloudinary from "@/lib/utils/cloudinary";

// POST /api/admin/cloudinary/fix-all-blocked - Fix all blocked files from submissions
export async function POST() {
  try {
    await dbConnect();

    // Find all teams with task submissions
    const teams = await Team.find({
      "tasks.files": { $exists: true, $not: { $size: 0 } },
    });

    const allFiles: Array<{
      url: string;
      public_id: string;
      resource_type: "image" | "raw" | "video";
    }> = [];

    // Extract all file URLs from task submissions
    for (const team of teams) {
      for (const task of team.tasks) {
        if (task.files && task.files.length > 0) {
          for (const fileUrl of task.files) {
            // Extract public_id from Cloudinary URL
            // URL format: https://res.cloudinary.com/cloud_name/resource_type/upload/version/folder/filename.ext
            if (fileUrl.includes("cloudinary.com")) {
              const urlParts = fileUrl.split("/");
              const resourceTypeIndex = urlParts.findIndex(
                (part) => part === "image" || part === "raw" || part === "video"
              );

              if (
                resourceTypeIndex !== -1 &&
                urlParts.length > resourceTypeIndex + 3
              ) {
                // Get everything after the version number
                const versionIndex = resourceTypeIndex + 2; // skip 'upload' and get to version
                const pathAfterVersion = urlParts
                  .slice(versionIndex + 1)
                  .join("/");

                // For image uploads of PDFs, remove the .pdf extension from public_id
                let public_id = pathAfterVersion;
                const resource_type = urlParts[resourceTypeIndex] as
                  | "image"
                  | "raw"
                  | "video";

                if (
                  resource_type === "image" &&
                  pathAfterVersion.endsWith(".pdf")
                ) {
                  public_id = pathAfterVersion.replace(/\.pdf$/, "");
                }

                allFiles.push({
                  url: fileUrl,
                  public_id: public_id,
                  resource_type: resource_type,
                });
              }
            }
          }
        }
      }
    }

    if (allFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No files found in submissions",
        processed: 0,
      });
    }

    console.log(`Found ${allFiles.length} files to process`);

    const results = [];
    let fixed = 0;
    let failed = 0;

    // Process files in batches to avoid overwhelming Cloudinary
    const batchSize = 10;
    for (let i = 0; i < allFiles.length; i += batchSize) {
      const batch = allFiles.slice(i, i + batchSize);

      for (const fileInfo of batch) {
        try {
          // Use explicit to change access mode to public
          const result = await cloudinary.uploader.explicit(
            fileInfo.public_id,
            {
              type: "upload",
              resource_type: fileInfo.resource_type,
              access_mode: "public",
            }
          );

          results.push({
            public_id: fileInfo.public_id,
            url: fileInfo.url,
            new_url: result.secure_url,
            success: true,
          });
          fixed++;
        } catch (error: unknown) {
          const err = error as { message?: string };
          console.error(`Failed to fix ${fileInfo.public_id}:`, err);
          results.push({
            public_id: fileInfo.public_id,
            url: fileInfo.url,
            success: false,
            error: err.message || "Unknown error",
          });
          failed++;
        }
      }

      // Small delay between batches
      if (i + batchSize < allFiles.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processing complete. Fixed: ${fixed}, Failed: ${failed}`,
      total_files: allFiles.length,
      fixed,
      failed,
      results: results.slice(0, 20), // Return first 20 results
      all_public_ids: allFiles,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Fix all blocked files error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/admin/cloudinary/fix-all-blocked - Get information
export async function GET() {
  try {
    await dbConnect();

    // Find all teams with task submissions
    const teams = await Team.find({
      "tasks.files": { $exists: true, $not: { $size: 0 } },
    });

    let fileCount = 0;
    const sampleFiles: string[] = [];

    for (const team of teams) {
      for (const task of team.tasks) {
        if (task.files && task.files.length > 0) {
          fileCount += task.files.length;
          if (sampleFiles.length < 5) {
            sampleFiles.push(...task.files.slice(0, 5 - sampleFiles.length));
          }
        }
      }
    }

    return NextResponse.json({
      info: "POST to this endpoint to fix access for all blocked files in submissions",
      teams_with_files: teams.length,
      total_files_found: fileCount,
      sample_files: sampleFiles,
      usage: "POST /api/admin/cloudinary/fix-all-blocked",
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to get file info" },
      { status: 500 }
    );
  }
}
