import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get admin credentials from environment
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, error: "Admin credentials not configured" },
        { status: 500 }
      );
    }

    // Verify credentials
    if (
      email.toLowerCase() === adminEmail.toLowerCase() &&
      password === adminPassword
    ) {
      // Create basic auth token (base64 encoded email:password)
      const credentials = Buffer.from(`${email}:${password}`).toString(
        "base64"
      );

      return NextResponse.json({
        success: true,
        message: "Admin login successful",
        token: credentials,
        admin: {
          email: adminEmail,
          isAuthenticated: true,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }
  } catch (error: unknown) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
