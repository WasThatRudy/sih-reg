import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "../../../../lib/middleware/auth";
import { User } from "../../../../models/User";
import dbConnect from "../../../../lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const authenticatedRequest = await verifyAuth(request);

    return NextResponse.json({
      success: true,
      user: authenticatedRequest.user,
    });
  } catch (error) {
    console.error("User verification error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebaseUid, email, name } = body;

    // This endpoint is called after Google OAuth to sync user with database
    if (!firebaseUid || !email || !name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // Create new team leader user
      user = new User({
        email: email.toLowerCase(),
        name: name.trim(),
        role: "leader",
        firebaseUid,
      });
      await user.save();
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
