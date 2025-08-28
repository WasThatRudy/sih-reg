import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "../../../../lib/middleware/adminAuth";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authenticatedRequest = await verifyAdminAuth(request);

    return NextResponse.json({
      success: true,
      admin: authenticatedRequest.admin,
    });
  } catch (error: unknown) {
    console.error("Admin verification error:", error);

    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }
}
