import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "../../../lib/middleware/auth";
import { verifyAdminAuth } from "../../../lib/middleware/adminAuth";
import { Team, ITeamMember } from "../../../models/Team";
import { ProblemStatement } from "../../../models/ProblemStatement";
import { User } from "../../../models/User";
import dbConnect from "../../../lib/mongodb";
import { validateTeamRegistration } from "../../../lib/utils/validation";
import { sendTeamRegistrationEmail } from "../../../lib/utils/email";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Check if user is currently logged in as admin
    try {
      const adminRequest = await verifyAdminAuth(request);
      if (adminRequest.admin) {
        return NextResponse.json(
          {
            success: false,
            error: "Please logout as admin first to register as a team member",
            isAdmin: true,
            adminEmail: adminRequest.admin.email,
          },
          { status: 403 }
        );
      }
    } catch {
      // Not logged in as admin, continue with normal flow
    }

    // Authenticate user with Firebase (for team registration)
    const authenticatedRequest = await verifyAuth(request);
    const user = authenticatedRequest.user;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if user already has a team
    const existingTeam = await Team.findOne({ leader: user._id });
    if (existingTeam) {
      return NextResponse.json(
        { success: false, error: "You have already registered a team" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { teamName, problemStatement, teamLeader, members } = body;

    // Combine team leader and members into a single members array
    // The team leader should be the first member in the array (total 5 members + 1 leader = 6 people)
    const allMembers: ITeamMember[] = [];

    // Add team leader as the first member if provided
    if (teamLeader) {
      allMembers.push({
        name: teamLeader.name,
        email: teamLeader.email,
        phone: teamLeader.phone,
        college: teamLeader.college || "Dayananda Sagar College of Engineering", // Default college
        year: teamLeader.year,
        branch: teamLeader.branch,
        gender: teamLeader.gender?.toLowerCase() as "male" | "female" | "other", // Normalize case
      });
    }

    // Add other members (should be 5 members to make total of 6 including leader)
    if (members && Array.isArray(members)) {
      // Filter out members with invalid/empty data and only take first 5 if team leader provided
      const validMembers = members.filter(
        (member) =>
          member.name &&
          member.email &&
          member.phone &&
          member.gender &&
          member.gender.trim() !== ""
      );

      const maxMembers = teamLeader ? 5 : 6;
      const membersToAdd = validMembers.slice(0, maxMembers);

      membersToAdd.forEach((member) => {
        allMembers.push({
          name: member.name,
          email: member.email,
          phone: member.phone,
          college: member.college || "Dayananda Sagar College of Engineering", // Default college
          year: member.year,
          branch: member.branch,
          gender: member.gender?.toLowerCase() as "male" | "female" | "other", // Normalize case
        });
      });
    }

    // Validate input data
    const validation = validateTeamRegistration({
      teamName,
      problemStatement,
      members: allMembers,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors,
          error: "Validation failed",
        },
        { status: 400 }
      );
    }

    // Check if team name is unique
    const existingTeamName = await Team.findOne({
      teamName: { $regex: new RegExp("^" + teamName.trim() + "$", "i") },
    });
    if (existingTeamName) {
      return NextResponse.json(
        { success: false, error: "Team name already exists" },
        { status: 400 }
      );
    }

    // Check problem statement availability
    const ps = await ProblemStatement.findById(problemStatement);
    if (!ps) {
      return NextResponse.json(
        { success: false, error: "Invalid problem statement" },
        { status: 400 }
      );
    }

    if (!ps.isActive || ps.teamCount >= ps.maxTeams) {
      return NextResponse.json(
        { success: false, error: "Problem statement is no longer available" },
        { status: 400 }
      );
    }

    // Create team using transaction
    const session = await mongoose.startSession();

    let result;

    try {
      await session.withTransaction(async () => {
        // Create the team
        const team = new Team({
          teamName: teamName.trim(),
          leader: user._id,
          members: allMembers,
          problemStatement,
          status: "registered",
          registrationDate: new Date(),
        });

        await team.save({ session });

        // Update problem statement team count
        await ProblemStatement.findByIdAndUpdate(
          problemStatement,
          { $inc: { teamCount: 1 } },
          { session }
        );

        // Update user's team reference
        await User.findByIdAndUpdate(user._id, { team: team._id }, { session });

        result = {
          success: true,
          message: "Team registered successfully",
          team: {
            _id: team._id,
            teamName: team.teamName,
            status: team.status,
            registrationDate: team.registrationDate,
          },
        };
      });

      // Send confirmation email after successful transaction
      try {
        await sendTeamRegistrationEmail(
          teamName,
          user.name,
          user.email,
          ps.title
        );
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Don't fail the registration if email fails
      }

      return NextResponse.json(result);
    } finally {
      await session.endSession();
    }
  } catch (error: unknown) {
    console.error("Team registration error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to register team",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    // Get user's team if exists
    const team = await Team.findOne({ leader: user._id })
      .populate("problemStatement", "psNumber title description domain")
      .populate("leader", "name email phone branch year gender")
      .lean();

    if (!team) {
      return NextResponse.json({
        success: true,
        isRegistered: false,
        message: "No team registered yet. You can create a new team.",
        team: null,
      });
    }

    return NextResponse.json({
      success: true,
      isRegistered: true,
      message: `Your team "${team.teamName}" is already registered`,
      team: {
        _id: team._id,
        teamName: team.teamName,
        leader: team.leader,
        members: team.members,
        problemStatement: team.problemStatement,
        status: team.status,
        registrationDate: team.registrationDate,
        tasks: team.tasks,
      },
    });
  } catch (error: unknown) {
    console.error("Get team error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to get team information" },
      { status: 500 }
    );
  }
}
