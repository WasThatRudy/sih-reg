import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/firebase-admin";
import { User } from "../../../../models/User";
import dbConnect from "../../../../lib/mongodb";
import { validateAdminRegistration } from "../../../../lib/utils/validation";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, password, adminSecretKey } = body;

    // Validate input
    const validation = validateAdminRegistration({
      name,
      email,
      password,
      adminSecretKey,
    });
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      );
    }

    if (!auth) {
      return NextResponse.json(
        { error: "Firebase authentication not configured" },
        { status: 500 }
      );
    }

    // Create user in Firebase Auth
    const firebaseUser = await auth.createUser({
      email: email.toLowerCase(),
      password,
      displayName: name,
    });

    // Create user in database
    const user = new User({
      email: email.toLowerCase(),
      name: name.trim(),
      role: "admin",
      firebaseUid: firebaseUser.uid,
    });

    await user.save();

    // Generate custom token for immediate login
    const customToken = await auth.createCustomToken(firebaseUser.uid, {
      role: "admin",
      userId: user._id.toString(),
    });

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      customToken,
    });
  } catch (error: unknown) {
    console.error("Admin register error:", error);

    // Handle Firebase Auth errors
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "auth/email-already-exists"
    ) {
      return NextResponse.json(
        { success: false, error: "Email already exists in Firebase" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create admin account" },
      { status: 500 }
    );
  }
}
