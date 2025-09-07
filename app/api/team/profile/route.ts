import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "../../../../lib/middleware/auth";
import { User } from "../../../../models/User";
import dbConnect from "../../../../lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate user
    const authenticatedRequest = await verifyAuth(request);
    const user = authenticatedRequest.user;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is a team leader
    if (user.role !== "leader") {
      return NextResponse.json(
        { success: false, error: "Only team leaders can check profile status" },
        { status: 403 }
      );
    }

    // Get full user details from database
    const fullUser = await User.findById(user._id);
    
    if (!fullUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if leader information is complete
    const requiredFields: (keyof typeof fullUser)[] = ['phone', 'gender', 'college', 'year', 'branch'];
    const missingFields = requiredFields.filter(field => !fullUser[field]);
    const isProfileComplete = missingFields.length === 0;

    return NextResponse.json({
      success: true,
      isProfileComplete,
      missingFields,
      currentData: {
        name: fullUser.name,
        email: fullUser.email,
        phone: fullUser.phone || '',
        gender: fullUser.gender || '',
        college: fullUser.college || '',
        year: fullUser.year || '',
        branch: fullUser.branch || ''
      }
    });

  } catch (error: unknown) {
    console.error("Profile status check error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to check profile status" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate user
    const authenticatedRequest = await verifyAuth(request);
    const user = authenticatedRequest.user;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is a team leader
    if (user.role !== "leader") {
      return NextResponse.json(
        { success: false, error: "Only team leaders can update profile" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { phone, gender, college, year, branch } = body;

    // Validate required fields
    const errors: string[] = [];
    
    if (!phone || phone.trim().length === 0) {
      errors.push("Phone number is required");
    }
    
    if (!gender || !['male', 'female', 'other'].includes(gender.toLowerCase())) {
      errors.push("Valid gender is required");
    }
    
    if (!college || college.trim().length < 3) {
      errors.push("College name is required");
    }
    
    if (!year || year.trim().length === 0) {
      errors.push("Year is required");
    }
    
    if (!branch || branch.trim().length < 2) {
      errors.push("Branch is required");
    }

    // Phone validation
    const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
    if (phone && !phoneRegex.test(phone.replace(/\s/g, ""))) {
      errors.push("Invalid phone number format");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        phone: phone.trim(),
        gender: gender.toLowerCase(),
        college: college.trim(),
        year: year.trim(),
        branch: branch.trim()
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        college: updatedUser.college,
        year: updatedUser.year,
        branch: updatedUser.branch
      }
    });

  } catch (error: unknown) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
