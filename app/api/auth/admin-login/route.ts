import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/firebase-admin";
import { User } from "../../../../models/User";
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

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Validate password
    if (!password || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Check if user exists and is an admin
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required. Contact system administrator.",
        },
        { status: 403 }
      );
    }

    // Verify Firebase user exists and is active
    if (!user.firebaseUid) {
      return NextResponse.json(
        { success: false, error: "User account not properly initialized" },
        { status: 400 }
      );
    }

    try {
      // Verify Firebase Admin is initialized
      if (!auth) {
        return NextResponse.json(
          { success: false, error: "Authentication service unavailable" },
          { status: 500 }
        );
      }

      // Verify the user exists in Firebase and is active
      const firebaseUser = await auth.getUser(user.firebaseUid);

      if (firebaseUser.disabled) {
        return NextResponse.json(
          { success: false, error: "Account is disabled" },
          { status: 403 }
        );
      }

      // Update/ensure custom claims are set for admin
      await auth.setCustomUserClaims(user.firebaseUid, {
        role: "admin",
        userId: user._id.toString(),
      });
    } catch (firebaseError) {
      console.error("Firebase user verification error:", firebaseError);
      return NextResponse.json(
        { success: false, error: "User account verification failed" },
        { status: 400 }
      );
    }

    // Return success response with user data
    return NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        firebaseUid: user.firebaseUid,
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
