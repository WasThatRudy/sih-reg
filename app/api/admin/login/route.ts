import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import jwt from "jsonwebtoken";

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

    // Connect to database
    await dbConnect();

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get JWT secret from environment
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { success: false, error: "Authentication not configured" },
        { status: 500 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        isAdmin: true,
      },
      jwtSecret,
      { expiresIn: "24h" }
    );

    return NextResponse.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        _id: admin._id,
        email: admin.email,
        isAuthenticated: true,
        createdAt: admin.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
