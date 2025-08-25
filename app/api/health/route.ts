import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  try {
    // Test database connection
    await dbConnect();

    return NextResponse.json({
      success: true,
      message: "SIH Registration Portal API is healthy",
      timestamp: new Date().toISOString(),
      database: "Connected",
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Health check failed",
        timestamp: new Date().toISOString(),
        database: "Disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
