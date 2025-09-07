import { NextResponse } from "next/server";

export async function POST() {
  try {
    // For basic auth, logout is handled client-side by clearing credentials
    // No server-side session to invalidate

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
