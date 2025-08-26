import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/firebase-admin";
import { User } from "../../../../models/User";
import dbConnect from "../../../../lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, password, adminSecretKey } = body;

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
    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;
    let firebaseUid = "";

    if (user) {
      // User exists - check if already admin
      if (user.role === "admin") {
        return NextResponse.json(
          { success: false, error: "User is already an admin" },
          { status: 400 }
        );
      }

      // Update existing user role to admin
      user.role = "admin";
      firebaseUid = user.firebaseUid;
    } else {
      // User doesn't exist - create new admin user
      isNewUser = true;

      // Validate required fields for new user
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "Name is required for new admin user" },
          { status: 400 }
        );
      }

      if (!password || password.length < 8) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Password must be at least 8 characters long for new admin user",
          },
          { status: 400 }
        );
      }

      // Create Firebase user first
      if (!auth) {
        return NextResponse.json(
          { success: false, error: "Authentication service unavailable" },
          { status: 500 }
        );
      }

      try {
        const firebaseUser = await auth.createUser({
          email: email.toLowerCase(),
          password: password,
          displayName: name.trim(),
        });
        firebaseUid = firebaseUser.uid;
      } catch (firebaseError: unknown) {
        console.error("Firebase user creation error:", firebaseError);
        return NextResponse.json(
          { success: false, error: "Failed to create user account" },
          { status: 500 }
        );
      }

      // Create new user in MongoDB
      user = new User({
        email: email.toLowerCase(),
        name: name.trim(),
        role: "admin",
        firebaseUid: firebaseUid,
      });
    }

    // Save user to MongoDB
    await user.save();

    // Update/set custom claims in Firebase
    if (auth && firebaseUid) {
      try {
        await auth.setCustomUserClaims(firebaseUid, {
          role: "admin",
          userId: user._id.toString(),
        });
      } catch (firebaseError) {
        console.error("Firebase claims update error:", firebaseError);
        // Don't fail the request if Firebase update fails, just log it
      }
    }

    return NextResponse.json({
      success: true,
      message: isNewUser
        ? "Admin user created successfully"
        : "User role updated to admin successfully",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    console.error("Admin registration error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to register admin user" },
      { status: 500 }
    );
  }
}
