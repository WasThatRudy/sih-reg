import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";
import { Team } from "@/models/Team";
import dbConnect from "@/lib/mongodb";

// PATCH /api/admin/teams/[teamId]/status - Update team status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await context.params;

    // Verify admin authentication
    const isAuthenticated = await verifyAdminAuth(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { status } = await request.json();

    // Validate status
    const validStatuses = [
      "registered",
      "selected",
      "waitlisted",
      "rejected",
      "finalist",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update team status
    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { status },
      { new: true }
    ).populate("leader", "name email");

    if (!updatedTeam) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Team status updated successfully",
      team: {
        _id: updatedTeam._id,
        teamName: updatedTeam.teamName,
        status: updatedTeam.status,
        leader: updatedTeam.leader,
      },
    });
  } catch (error: unknown) {
    console.error("Update team status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update team status" },
      { status: 500 }
    );
  }
}
