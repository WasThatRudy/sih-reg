import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/firebase-admin";
import { User } from "../../../../models/User";
import dbConnect from "../../../../lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, adminSecretKey } = body;

    // Validate admin secret key
    if (!adminSecretKey || adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: "Invalid admin secret key" },
        { status: 401 }
      );
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email does not exist" },
        { status: 404 }
      );
    }

    // Check if user is already an admin
    if (existingUser.role === "admin") {
      return NextResponse.json(
        { success: false, error: "User is already an admin" },
        { status: 400 }
      );
    }

    // Update user role to admin in MongoDB
    existingUser.role = "admin";
    await existingUser.save();

    // Update custom claims in Firebase (if Firebase is configured)
    if (auth && existingUser.firebaseUid) {
      try {
        await auth.setCustomUserClaims(existingUser.firebaseUid, {
          role: "admin",
          userId: existingUser._id.toString(),
        });
      } catch (firebaseError) {
        console.error("Firebase claims update error:", firebaseError);
        // Don't fail the request if Firebase update fails, just log it
      }
    }

    return NextResponse.json({
      success: true,
      message: "User role updated to admin successfully",
      user: {
        _id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
      },
    });
  } catch (error: unknown) {
    console.error("Admin role update error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update user role to admin" },
      { status: 500 }
    );
  }
}
