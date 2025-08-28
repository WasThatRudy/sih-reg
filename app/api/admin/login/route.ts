import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Admin } from "../../../../models/Admin";
import dbConnect from "../../../../lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

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

    // Generate JWT token (expires in 1 month)
    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        email: admin.email,
        role: "admin",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        _id: admin._id,
        email: admin.email,
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
