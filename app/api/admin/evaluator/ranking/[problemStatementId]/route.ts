import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";
import dbConnect from "@/lib/mongodb";

// Import models after database connection to avoid registration issues

// GET /api/admin/evaluator/ranking/[problemStatementId] - Get teams to rank for a problem statement
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ problemStatementId: string }> }
) {
  try {
    const { problemStatementId } = await context.params;

    // Verify admin authentication
    const authenticatedRequest = await verifyAdminAuth(request);

    await dbConnect();

    // Import models after connection to avoid registration issues
    const { Admin } = await import("@/models/Admin");
    const { Team } = await import("@/models/Team");
    const { Evaluation } = await import("@/models/Evaluation");
    const { ProblemStatement } = await import("@/models/ProblemStatement");
    const { Task } = await import("@/models/Task");
    const { User } = await import("@/models/User");

    // Get the current evaluator
    const evaluator = await Admin.findById(authenticatedRequest.admin?._id);

    if (!evaluator || evaluator.role !== "evaluator") {
      return NextResponse.json(
        { success: false, error: "Evaluator access required" },
        { status: 403 }
      );
    }

    // Check if this problem statement is assigned to the evaluator
    const isAssigned = evaluator.assignedProblemStatements.some(
      (psId) => psId.toString() === problemStatementId
    );

    if (!isAssigned) {
      return NextResponse.json(
        {
          success: false,
          error: "Problem statement not assigned to this evaluator",
        },
        { status: 403 }
      );
    }

    // Get problem statement details
    const problemStatement = await ProblemStatement.findById(
      problemStatementId
    );
    if (!problemStatement) {
      return NextResponse.json(
        { success: false, error: "Problem statement not found" },
        { status: 404 }
      );
    }

    // Get teams for this problem statement (all teams except rejected ones)
    const teams = await Team.find({
      problemStatement: problemStatementId,
      status: { $ne: "rejected" }, // Exclude rejected teams (AI-filtered)
    })
      .populate("leader", "name email")
      .populate({
        path: "tasks.taskId",
        select: "title description type fields dueDate",
      })
      .select("teamName leader status registrationDate tasks")
      .lean();

    // Get existing evaluation if any
    const existingEvaluation = await Evaluation.findOne({
      problemStatementId,
      evaluatorId: evaluator._id,
    });

    // Get all evaluations for teams in this problem statement
    const teamEvaluations = await Evaluation.find({
      "rankings.teamId": { $in: teams.map(team => team._id) }
    }).lean();

    // Prepare teams with existing rankings and organized submissions
    const teamsWithRankings = teams.map((team) => {
      const existingRanking = existingEvaluation?.rankings.find(
        (r) => r.teamId.toString() === team._id.toString()
      );

      // Find evaluation that includes this team (similar to teamId route pattern)
      const teamEvaluation = teamEvaluations.find(evaluation => 
        evaluation.rankings.some(ranking => 
          ranking.teamId.toString() === team._id.toString()
        )
      );

      // Organize task submissions with task details
      const organizedSubmissions = team.tasks
        .filter((submission) => submission.status === "submitted")
        .map((submission) => {
          const taskData = submission.taskId as unknown as {
            _id: string;
            title: string;
            type?: string;
          };

          return {
            taskId: taskData._id,
            taskTitle: taskData.title || "Untitled Task",
            taskType: taskData.type || "general",
            submittedAt: submission.submittedAt,
            files: submission.files || [],
            data: submission.data || {},
            status: submission.status,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
        );

      return {
        _id: team._id,
        teamName: team.teamName,
        leader: team.leader,
        status: team.status,
        registrationDate: team.registrationDate,
        submissions: organizedSubmissions,
        currentRank: existingRanking?.rank,
        score: existingRanking?.score,
        comments: existingRanking?.comments,
        evaluation: teamEvaluation,
      };
    });

    return NextResponse.json({
      success: true,
      problemStatement: {
        _id: problemStatement._id,
        title: problemStatement.title,
        description: problemStatement.description,
      },
      teams: teamsWithRankings,
      evaluation: existingEvaluation
        ? {
            _id: existingEvaluation._id,
            isFinalized: existingEvaluation.isFinalized,
            submittedAt: existingEvaluation.submittedAt,
          }
        : null,
    });
  } catch (error: unknown) {
    console.error("Get ranking teams error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teams for ranking" },
      { status: 500 }
    );
  }
}

// POST /api/admin/evaluator/ranking/[problemStatementId] - Save rankings
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ problemStatementId: string }> }
) {
  try {
    const { problemStatementId } = await context.params;

    // Verify admin authentication
    const authenticatedRequest = await verifyAdminAuth(request);

    await dbConnect();

    // Import models after connection to avoid registration issues
    const { Admin } = await import("@/models/Admin");
    const { Team } = await import("@/models/Team");
    const { Evaluation } = await import("@/models/Evaluation");
    const { ProblemStatement } = await import("@/models/ProblemStatement");
    const { Task } = await import("@/models/Task");
    const { User } = await import("@/models/User");

    // Get the current evaluator
    const evaluator = await Admin.findById(authenticatedRequest.admin?._id);

    if (!evaluator || evaluator.role !== "evaluator") {
      return NextResponse.json(
        { success: false, error: "Evaluator access required" },
        { status: 403 }
      );
    }

    // Check if this problem statement is assigned to the evaluator
    const isAssigned = evaluator.assignedProblemStatements.some(
      (psId) => psId.toString() === problemStatementId
    );

    if (!isAssigned) {
      return NextResponse.json(
        {
          success: false,
          error: "Problem statement not assigned to this evaluator",
        },
        { status: 403 }
      );
    }

    const { rankings, isFinalized } = await request.json();

    // Validate rankings
    if (!Array.isArray(rankings) || rankings.length === 0) {
      return NextResponse.json(
        { success: false, error: "Rankings array is required" },
        { status: 400 }
      );
    }

    // Validate ranking structure
    const ranks = rankings.map((r) => r.rank).sort((a, b) => a - b);
    for (let i = 0; i < ranks.length; i++) {
      if (ranks[i] !== i + 1) {
        return NextResponse.json(
          {
            success: false,
            error: "Rankings must be sequential starting from 1",
          },
          { status: 400 }
        );
      }
    }

    // Verify all teams exist and belong to this problem statement
    const teamIds = rankings.map((r) => r.teamId);
    const teams = await Team.find({
      _id: { $in: teamIds },
      problemStatement: problemStatementId,
      status: { $ne: "rejected" }, // Allow all teams except rejected
    });

    if (teams.length !== teamIds.length) {
      return NextResponse.json(
        { success: false, error: "Invalid teams in ranking" },
        { status: 400 }
      );
    }

    // Prepare ranking data
    const rankingData = rankings.map((r) => ({
      teamId: r.teamId,
      rank: r.rank,
      score: r.score || undefined,
      comments: r.comments || undefined,
      evaluatedAt: new Date(),
    }));

    // Create or update evaluation
    const evaluation = await Evaluation.findOneAndUpdate(
      {
        problemStatementId,
        evaluatorId: evaluator._id,
      },
      {
        problemStatementId,
        evaluatorId: evaluator._id,
        rankings: rankingData,
        isFinalized: !!isFinalized,
        totalTeams: teams.length,
        ...(isFinalized && { submittedAt: new Date() }),
      },
      {
        upsert: true,
        new: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: isFinalized
        ? "Rankings finalized successfully"
        : "Rankings saved as draft",
      evaluation: {
        _id: evaluation._id,
        isFinalized: evaluation.isFinalized,
        submittedAt: evaluation.submittedAt,
        rankings: evaluation.rankings,
      },
    });
  } catch (error: unknown) {
    console.error("Save rankings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save rankings" },
      { status: 500 }
    );
  }
}
