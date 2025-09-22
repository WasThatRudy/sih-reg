import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";
import dbConnect from "@/lib/mongodb";

// GET /api/admin/rankings/problem-statements - Get all problem statements with evaluation statistics
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authenticatedRequest = await verifyAdminAuth(request);

    await dbConnect();

    // Import models after connection
    const { Admin } = await import("@/models/Admin");
    const { Evaluation } = await import("@/models/Evaluation");
    const { Team } = await import("@/models/Team");
    const { ProblemStatement } = await import("@/models/ProblemStatement");

    // Check if user is super admin
    const admin = await Admin.findById(authenticatedRequest.admin?._id);
    if (!admin || admin.role !== "super-admin") {
      return NextResponse.json(
        { success: false, error: "Super admin access required" },
        { status: 403 }
      );
    }

    // Get all active problem statements
    const problemStatements = await ProblemStatement.find({
      isActive: true,
    })
      .select("psNumber title description")
      .lean();

    // Get all evaluator assignments
    const evaluators = await Admin.find({
      role: "evaluator",
      isActive: true,
    })
      .select("assignedProblemStatements")
      .lean();

    // Get all evaluations
    const allEvaluations = await Evaluation.find({})
      .select("problemStatementId evaluatorId isFinalized rankings")
      .lean();

    // Get team counts for all problem statements (only teams with at least 1 task)
    const teamCounts = await Team.aggregate([
      {
        $match: {
          status: { $ne: "rejected" },
          $expr: { $gte: [{ $size: "$tasks" }, 1] }, // Only teams with at least 1 task
        },
      },
      {
        $group: {
          _id: "$problemStatement",
          count: { $sum: 1 },
        },
      },
    ]);

    // Create a map for quick lookups
    const teamCountMap = new Map();
    teamCounts.forEach((tc) => {
      teamCountMap.set(tc._id.toString(), tc.count);
    });

    // Calculate statistics for each problem statement
    const problemStatementsWithStats = problemStatements
      .map((ps) => {
        const psId = ps._id.toString();

        // Count assigned evaluators
        const assignedEvaluators = evaluators.filter((evaluator) =>
          evaluator.assignedProblemStatements.some(
            (assignmentId) => assignmentId.toString() === psId
          )
        ).length;

        // Get evaluations for this problem statement
        const psEvaluations = allEvaluations.filter(
          (evaluation) => evaluation.problemStatementId.toString() === psId
        );

        // Count completed evaluations
        const completedEvaluations = psEvaluations.filter(
          (evaluation) => evaluation.isFinalized
        ).length;

        // Calculate conflicts (simplified - teams with high ranking variance)
        const conflictingTeams = calculateConflicts(psEvaluations);

        // Get total teams
        const totalTeams = teamCountMap.get(psId) || 0;

        return {
          _id: ps._id,
          psNumber: ps.psNumber,
          title: ps.title,
          description: ps.description,
          assignedEvaluators,
          completedEvaluations,
          totalTeams,
          conflictingTeams,
          isActive: true,
        };
      })
      .filter((ps) => ps.totalTeams > 0 && ps.assignedEvaluators > 0); // Only show problem statements with both teams (with tasks) and assigned evaluators

    return NextResponse.json({
      success: true,
      problemStatements: problemStatementsWithStats,
    });
  } catch (error) {
    console.error("Get problem statements rankings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch problem statements rankings" },
      { status: 500 }
    );
  }
}

// Helper function to calculate conflicts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateConflicts(evaluations: any[]): number {
  if (evaluations.length < 2) return 0;

  // Get all finalized evaluations
  const finalizedEvaluations = evaluations.filter(
    (evaluation) => evaluation.isFinalized
  );
  if (finalizedEvaluations.length < 2) return 0;

  // Group rankings by team
  const teamRankings = new Map();

  finalizedEvaluations.forEach((evaluation) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evaluation.rankings.forEach((ranking: any) => {
      const teamId = ranking.teamId.toString();
      if (!teamRankings.has(teamId)) {
        teamRankings.set(teamId, []);
      }
      teamRankings.get(teamId).push(ranking.rank);
    });
  });

  // Count teams with high variance in rankings
  let conflictingTeams = 0;

  teamRankings.forEach((ranks) => {
    if (ranks.length >= 2) {
      const avg =
        ranks.reduce((sum: number, rank: number) => sum + rank, 0) /
        ranks.length;
      const variance =
        ranks.reduce(
          (sum: number, rank: number) => sum + Math.pow(rank - avg, 2),
          0
        ) / ranks.length;
      const stdDev = Math.sqrt(variance);

      // Consider it a conflict if standard deviation > 2
      if (stdDev > 2) {
        conflictingTeams++;
      }
    }
  });

  return conflictingTeams;
}
