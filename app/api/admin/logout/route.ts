import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "../../../../lib/middleware/adminAuth";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request);

    // For JWT tokens, logout is handled client-side by removing the token
    // But we can add server-side token blacklisting in the future if needed

    return NextResponse.json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error: unknown) {
    console.error("Admin logout error:", error);

    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
