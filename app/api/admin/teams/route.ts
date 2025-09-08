import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "../../../../lib/middleware/adminAuth";
import dbConnect from "../../../../lib/mongodb";
import { Team, ITeam } from "../../../../models/Team";

// Import models to ensure they are registered with Mongoose
import "../../../../models/User";
import "../../../../models/ProblemStatement";

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    await verifyAdminAuth(request);

    await dbConnect();

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [{ teamName: { $regex: search, $options: "i" } }];
    }

    // Get teams with pagination
    const teams = await Team.find(query)
      .populate("leader", "name email phone")
      .populate("problemStatement", "psNumber title domain")
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalTeams = await Team.countDocuments(query);

    return NextResponse.json({
      success: true,
      teams: teams.map((team: ITeam) => ({
        _id: team._id,
        teamName: team.teamName,
        leader: team.leader,
        problemStatement: team.problemStatement,
        status: team.status,
        registrationDate: team.registrationDate,
        memberCount: team.members.length,
        taskCount: team.tasks.length,
      })),
      total: totalTeams,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTeams / limit),
        totalTeams,
        hasMore: skip + teams.length < totalTeams,
      },
    });
  } catch (error: unknown) {
    console.error("Get teams error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to get teams" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate admin
    await verifyAdminAuth(request);

    await dbConnect();

    const body = await request.json();
    const { teamId, status } = body;

    if (!teamId || !status) {
      return NextResponse.json(
        { success: false, error: "Team ID and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["registered", "selected", "rejected", "finalist"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const team = await Team.findByIdAndUpdate(teamId, { status }, { new: true })
      .populate("leader", "name email phone")
      .populate("problemStatement", "title");

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Team status updated successfully",
      team: {
        _id: team._id,
        teamName: team.teamName,
        status: team.status,
        leader: team.leader,
        problemStatement: team.problemStatement,
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