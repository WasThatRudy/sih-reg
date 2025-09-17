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

    // Determine role based on secret key
    const evaluatorSecret = process.env.EVALUATOR_REGISTRATION_SECRET;
    const superAdminSecret = process.env.SUPER_ADMIN_REGISTRATION_SECRET;

    if (!evaluatorSecret || !superAdminSecret) {
      return NextResponse.json(
        { success: false, error: "Admin registration not configured" },
        { status: 500 }
      );
    }

    let adminRole: "evaluator" | "super-admin";
    if (secretKey === evaluatorSecret) {
      adminRole = "evaluator";
    } else if (secretKey === superAdminSecret) {
      adminRole = "super-admin";
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid secret key" },
        { status: 401 }
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
      role: adminRole,
      isActive: true,
    });

    await newAdmin.save();

    return NextResponse.json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        _id: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role,
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
