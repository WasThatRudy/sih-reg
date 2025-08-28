import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Admin } from "../../../../models/Admin";
import dbConnect from "../../../../lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password, adminSecretKey } = body;

    // Validate admin secret key
    if (!adminSecretKey || adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: "Invalid admin secret key" },
        { status: 401 }
      );
    }

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
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate email domain - only @pointblank.club emails allowed
    if (!email.toLowerCase().endsWith('@pointblank.club')) {
      return NextResponse.json(
        { success: false, error: "Admin registration is only allowed for @pointblank.club email addresses" },
        { status: 403 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new admin
    const admin = new Admin({
      email: email.toLowerCase(),
      passwordHash,
    });

    await admin.save();

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      admin: {
        _id: admin._id,
        email: admin.email,
      },
    });
  } catch (error: unknown) {
    console.error("Admin registration error:", error);

    if (error instanceof Error && error.message.includes("duplicate key")) {
      return NextResponse.json(
        { success: false, error: "Admin with this email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to register admin" },
      { status: 500 }
    );
  }
}
