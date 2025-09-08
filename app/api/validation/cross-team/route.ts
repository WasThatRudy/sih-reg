import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "../../../../lib/middleware/auth";
import { validateCrossTeamDuplicates } from "../../../../lib/utils/validation";
import dbConnect from "../../../../lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authenticatedRequest = await verifyAuth(request);
    const user = authenticatedRequest.user;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { teamLeader, members } = body;

    // Validate the request format
    if (!Array.isArray(members)) {
      return NextResponse.json(
        { success: false, error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Perform cross-team duplicate validation
    const validation = await validateCrossTeamDuplicates({
      teamLeader: teamLeader
        ? {
            email: teamLeader.email || "",
            phone: teamLeader.phone || "",
          }
        : undefined,
      members: members.map((member: { email?: string; phone?: string }) => ({
        email: member.email || "",
        phone: member.phone || "",
      })),
    });

    return NextResponse.json({
      success: true,
      isValid: validation.isValid,
      errors: validation.errors,
      duplicateDetails: validation.duplicateDetails,
    });
  } catch (error: unknown) {
    console.error("Cross-team validation API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to validate team data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
