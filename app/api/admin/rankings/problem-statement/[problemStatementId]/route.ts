import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";
import dbConnect from "@/lib/mongodb";

// GET /api/admin/rankings/problem-statement/[problemStatementId] - Get all evaluator rankings for a problem statement
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ problemStatementId: string }> }
) {
  try {
    const { problemStatementId } = await context.params;

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

    // Get problem statement details
    const problemStatement = await ProblemStatement.findById(problemStatementId)
      .select("title description")
      .lean();

    if (!problemStatement) {
      return NextResponse.json(
        { success: false, error: "Problem statement not found" },
        { status: 404 }
      );
    }

    // Get all teams for this problem statement
    const teams = await Team.find({
      problemStatement: problemStatementId,
      status: { $ne: "rejected" },
    })
      .select("teamName leader")
      .populate("leader", "name email")
      .lean();

    // Get all evaluators assigned to this problem statement
    const assignedEvaluators = await Admin.find({
      role: "evaluator",
      assignedProblemStatements: problemStatementId,
      isActive: true,
    })
      .select("email")
      .lean();

    // Get all evaluations for this problem statement
    const evaluations = await Evaluation.find({
      problemStatementId: problemStatementId,
    })
      .populate("evaluatorId", "email")
      .lean();

    // Build comparison matrix
    const evaluatorRankings = assignedEvaluators.map((evaluator) => {
      const evaluation = evaluations.find(
        (evaluation) =>
          evaluation.evaluatorId._id.toString() === evaluator._id.toString()
      );

      return {
        evaluator: {
          _id: evaluator._id,
          email: evaluator.email,
        },
        evaluation: evaluation
          ? {
              _id: evaluation._id,
              isFinalized: evaluation.isFinalized,
              submittedAt: evaluation.submittedAt,
              rankings: evaluation.rankings.sort((a, b) => a.rank - b.rank),
            }
          : null,
      };
    });

    // Create consensus analysis for each team
    const consensusAnalysis = teams.map((team) => {
      const teamRankings = evaluatorRankings
        .filter((er) => er.evaluation?.isFinalized)
        .map((er) => {
          const ranking = er.evaluation?.rankings.find(
            (r) => r.teamId.toString() === team._id.toString()
          );
          return {
            evaluatorEmail: er.evaluator.email,
            rank: ranking?.rank,
            score: ranking?.score,
            comments: ranking?.comments,
          };
        })
        .filter((r) => r.rank !== undefined);

      const ranks = teamRankings
        .map((r) => r.rank)
        .filter((rank): rank is number => rank !== undefined);
      const scores = teamRankings
        .map((r) => r.score)
        .filter((score): score is number => score !== undefined);

      // Calculate consensus metrics
      const averageRank =
        ranks.length > 0
          ? ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length
          : null;
      const averageScore =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : null;

      // Calculate standard deviation for conflict detection
      let rankStdDev = null;
      if (ranks.length > 1 && averageRank !== null) {
        const variance =
          ranks.reduce(
            (sum, rank) => sum + Math.pow(rank - averageRank, 2),
            0
          ) / ranks.length;
        rankStdDev = Math.sqrt(variance);
      }

      // Determine conflict level
      let conflictLevel: "low" | "medium" | "high" = "low";
      if (rankStdDev !== null) {
        if (rankStdDev > 3) conflictLevel = "high";
        else if (rankStdDev > 1.5) conflictLevel = "medium";
      }

      return {
        team: {
          _id: team._id,
          teamName: team.teamName,
          leader: team.leader,
        },
        rankings: teamRankings,
        consensus: {
          averageRank,
          averageScore,
          rankStandardDeviation: rankStdDev,
          conflictLevel,
          evaluatorCount: teamRankings.length,
        },
      };
    });

    // Sort teams by average rank (best first)
    consensusAnalysis.sort((a, b) => {
      if (a.consensus.averageRank === null && b.consensus.averageRank === null)
        return 0;
      if (a.consensus.averageRank === null) return 1;
      if (b.consensus.averageRank === null) return -1;
      return a.consensus.averageRank - b.consensus.averageRank;
    });

    // Calculate overall statistics
    const totalEvaluators = assignedEvaluators.length;
    const completedEvaluations = evaluatorRankings.filter(
      (er) => er.evaluation?.isFinalized
    ).length;
    const pendingEvaluations = totalEvaluators - completedEvaluations;
    const conflictingTeams = consensusAnalysis.filter(
      (team) => team.consensus.conflictLevel === "high"
    ).length;

    return NextResponse.json({
      success: true,
      problemStatement,
      statistics: {
        totalTeams: teams.length,
        totalEvaluators,
        completedEvaluations,
        pendingEvaluations,
        conflictingTeams,
      },
      evaluatorRankings,
      consensusAnalysis,
    });
  } catch (error) {
    console.error("Get problem statement rankings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch problem statement rankings" },
      { status: 500 }
    );
  }
}
