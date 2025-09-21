import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";
import dbConnect from "@/lib/mongodb";

// GET /api/admin/rankings/evaluator/[evaluatorId] - Get specific evaluator's all rankings
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ evaluatorId: string }> }
) {
  try {
    const { evaluatorId } = await context.params;

    // Verify admin authentication
    const authenticatedRequest = await verifyAdminAuth(request);

    await dbConnect();

    // Import models after connection
    const { Admin } = await import("@/models/Admin");
    const { Evaluation } = await import("@/models/Evaluation");
    const { Team } = await import("@/models/Team");

    // Check if user is super admin
    const admin = await Admin.findById(authenticatedRequest.admin?._id);
    if (!admin || admin.role !== "super-admin") {
      return NextResponse.json(
        { success: false, error: "Super admin access required" },
        { status: 403 }
      );
    }

    // Get the specific evaluator
    const evaluator = await Admin.findById(evaluatorId)
      .populate("assignedProblemStatements", "title description")
      .select("email assignedProblemStatements isActive createdAt")
      .lean();

    if (!evaluator || evaluator.role !== "evaluator") {
      return NextResponse.json(
        { success: false, error: "Evaluator not found" },
        { status: 404 }
      );
    }

    // Get all evaluations by this evaluator
    const evaluations = await Evaluation.find({
      evaluatorId: evaluatorId,
    })
      .populate("problemStatementId", "title description")
      .populate({
        path: "rankings.teamId",
        select: "teamName leader",
        populate: {
          path: "leader",
          select: "name email",
        },
      })
      .lean();

    const assignedPS = evaluator.assignedProblemStatements as unknown as Array<{
      _id: string;
      title: string;
      description?: string;
    }>;

    // Build detailed evaluation data for each problem statement
    const detailedEvaluations = await Promise.all(
      assignedPS.map(async (ps) => {
        // Count total teams for this problem statement
        const totalTeams = await Team.countDocuments({
          problemStatement: ps._id,
          status: { $ne: "rejected" },
        });

        // Find evaluation for this problem statement
        const evaluation = evaluations.find(
          (evaluation) =>
            evaluation.problemStatementId._id.toString() === ps._id.toString()
        );

        // Get all teams for this problem statement for reference
        const allTeams = await Team.find({
          problemStatement: ps._id,
          status: { $ne: "rejected" },
        })
          .select("teamName leader")
          .populate("leader", "name email")
          .lean();

        return {
          problemStatement: ps,
          totalTeams,
          allTeams,
          evaluation: evaluation
            ? {
                _id: evaluation._id,
                isFinalized: evaluation.isFinalized,
                submittedAt: evaluation.submittedAt,
                rankings: evaluation.rankings
                  .map((ranking) => ({
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    teamId: (ranking as unknown as any).teamId._id,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    teamName: (ranking as unknown as any).teamId.teamName,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    teamLeader: (ranking as unknown as any).teamId.leader,
                    rank: ranking.rank,
                    score: ranking.score,
                    comments: ranking.comments,
                    evaluatedAt: ranking.evaluatedAt,
                  }))
                  .sort((a, b) => a.rank - b.rank),
                totalRanked: evaluation.rankings.length,
              }
            : null,
        };
      })
    );

    // Calculate overall statistics
    const totalAssignments = assignedPS.length;
    const completedEvaluations = detailedEvaluations.filter(
      (evaluation) => evaluation.evaluation?.isFinalized
    ).length;
    const draftEvaluations = detailedEvaluations.filter(
      (evaluation) =>
        evaluation.evaluation && !evaluation.evaluation.isFinalized
    ).length;
    const totalTeamsEvaluated = detailedEvaluations.reduce(
      (sum, evaluation) => sum + (evaluation.evaluation?.totalRanked || 0),
      0
    );

    return NextResponse.json({
      success: true,
      evaluator: {
        _id: evaluator._id,
        email: evaluator.email,
        isActive: evaluator.isActive,
        createdAt: evaluator.createdAt,
        statistics: {
          totalAssignments,
          completedEvaluations,
          draftEvaluations,
          totalTeamsEvaluated,
          progressPercentage:
            totalAssignments > 0
              ? Math.round((completedEvaluations / totalAssignments) * 100)
              : 0,
        },
        evaluations: detailedEvaluations,
      },
    });
  } catch (error) {
    console.error("Get evaluator details error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch evaluator details" },
      { status: 500 }
    );
  }
}
