import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "../../../../lib/middleware/adminAuth";
import dbConnect from "../../../../lib/mongodb";
import { Team, ITeam } from "../../../../models/Team";
import { User } from "../../../../models/User";
import { ProblemStatement } from "../../../../models/ProblemStatement";
import { DeletedTeam } from "../../../../models/DeletedTeam";
import { auth as firebaseAdmin } from "../../../../lib/firebase-admin";
import { sendEmail } from "../../../../lib/utils/email";
import mongoose from "mongoose";

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

export async function DELETE(request: NextRequest) {
  let session: mongoose.ClientSession | null = null;

  try {
    // Authenticate admin
    const adminPayload = await verifyAdminAuth(request);

    await dbConnect();

    const body = await request.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "Team ID is required" },
        { status: 400 }
      );
    }

    // Start a transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Get the team with all related data
    const team = await Team.findById(teamId)
      .populate(
        "leader",
        "name email phone gender college year branch firebaseUid"
      )
      .populate("problemStatement", "psNumber title domain teamCount")
      .session(session);

    if (!team) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    // Type-safe access to populated fields
    const leader = team.leader as unknown as {
      _id: string;
      name: string;
      email: string;
      phone?: string;
      gender?: string;
      college?: string;
      year?: string;
      branch?: string;
      firebaseUid?: string;
    };

    const problemStatement = team.problemStatement as unknown as {
      _id: string;
      psNumber: string;
      title: string;
      domain: string;
      teamCount: number;
    };

    // Step 1: Create backup in DeletedTeam collection
    const deletedTeamData = new DeletedTeam({
      originalTeamId: team._id.toString(),
      teamName: team.teamName,
      leader: {
        _id: leader._id.toString(),
        email: leader.email,
        name: leader.name,
        phone: leader.phone,
        gender: leader.gender,
        college: leader.college,
        year: leader.year,
        branch: leader.branch,
        firebaseUid: leader.firebaseUid,
      },
      members: team.members,
      problemStatement: {
        _id: problemStatement._id.toString(),
        psNumber: problemStatement.psNumber,
        title: problemStatement.title,
        domain: problemStatement.domain,
      },
      status: team.status,
      tasks: team.tasks,
      registrationDate: team.registrationDate,
      deletedBy: adminPayload.admin?.email || "unknown",
      reason: "Suspected fake or duplicate registration",
      originalCreatedAt: team.createdAt,
      originalUpdatedAt: team.updatedAt,
    });

    await deletedTeamData.save({ session });

    // Step 2: Delete Firebase account if exists
    if (leader.firebaseUid && firebaseAdmin) {
      try {
        await firebaseAdmin.deleteUser(leader.firebaseUid);
      } catch (firebaseError) {
        console.error("Failed to delete Firebase account:", firebaseError);
        await session.abortTransaction();
        return NextResponse.json(
          { success: false, error: "Failed to delete Firebase account" },
          { status: 500 }
        );
      }
    }

    // Step 3: Delete User document
    await User.findByIdAndDelete(leader._id).session(session);

    // Step 4: Decrease team count in problem statement
    await ProblemStatement.findByIdAndUpdate(
      problemStatement._id,
      { $inc: { teamCount: -1 } },
      { session }
    );

    // Step 5: Delete Team document
    await Team.findByIdAndDelete(teamId).session(session);

    // Step 6: Send email notification to leader
    if (leader.email) {
      try {
        const emailSubject = "Team Registration Removed - Action Required";
        const emailHTML = `
        <html>
        <body>
          <h2>Team Registration Removed</h2>
          <p>Dear ${leader.name},</p>
          
          <p>We hope this email finds you well. We are writing to inform you that your team registration for the Smart India Hackathon has been removed from our system due to suspected fake or duplicate registration.</p>
          
          <h3>Team Details:</h3>
          <ul>
            <li><strong>Team Name:</strong> ${team.teamName}</li>
            <li><strong>Problem Statement:</strong> ${
              problemStatement.psNumber
            } - ${problemStatement.title}</li>
            <li><strong>Registration Date:</strong> ${team.registrationDate.toLocaleDateString()}</li>
          </ul>
          
          <p>If you believe this action was taken in error, or if you would like to re-register with genuine information, please create a new account and register again with accurate details.</p>
          
          <h3>Important Notes:</h3>
          <ul>
            <li>Your previous account has been completely removed from our system</li>
            <li>You will need to sign up again with a new account</li>
            <li>Please ensure all information provided is accurate and genuine</li>
            <li>Duplicate or fake registrations are strictly prohibited</li>
          </ul>
          
          <p>If you have any questions or concerns, please contact our support team.</p>
          
          <p>Best regards,<br>Smart India Hackathon Team</p>
        </body>
        </html>
        `;

        await sendEmail({
          to: leader.email,
          subject: emailSubject,
          html: emailHTML,
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't abort transaction for email failure, just log it
      }
    }

    // Commit the transaction
    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: "Team removed successfully and leader has been notified",
      deletedTeam: {
        teamName: team.teamName,
        leaderEmail: leader.email,
        problemStatement: problemStatement.psNumber,
      },
    });
  } catch (error: unknown) {
    console.error("Delete team error:", error);

    if (session) {
      await session.abortTransaction();
    }

    return NextResponse.json(
      { success: false, error: "Failed to remove team" },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
