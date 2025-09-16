import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, secretKey } = body;

    // Validate required fields
    if (!email || !password || !secretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, password, and secret key are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Verify secret key
    const adminRegistrationSecret = process.env.ADMIN_REGISTRATION_SECRET;
    if (!adminRegistrationSecret) {
      return NextResponse.json(
        { success: false, error: "Admin registration not configured" },
        { status: 500 }
      );
    }

    if (secretKey !== adminRegistrationSecret) {
      return NextResponse.json(
        { success: false, error: "Invalid secret key" },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check if admin with this email already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new admin
    const newAdmin = new Admin({
      email: email.toLowerCase(),
      passwordHash,
    });

    await newAdmin.save();

    return NextResponse.json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        _id: newAdmin._id,
        email: newAdmin.email,
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error("Admin registration error:", error);

    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}
