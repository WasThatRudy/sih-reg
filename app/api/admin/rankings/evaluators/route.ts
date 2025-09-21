import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";
import dbConnect from "@/lib/mongodb";

// GET /api/admin/rankings/evaluators - Get all evaluators with their ranking progress
export async function GET(request: NextRequest) {
  try {
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

    // Get all evaluators with their assignments
    const evaluators = await Admin.find({
      role: "evaluator",
      isActive: true,
    })
      .populate("assignedProblemStatements", "title")
      .select("email assignedProblemStatements isActive createdAt")
      .lean();

    // For each evaluator, get their evaluation progress
    const evaluatorsWithProgress = await Promise.all(
      evaluators.map(async (evaluator) => {
        const assignedPS =
          evaluator.assignedProblemStatements as unknown as Array<{
            _id: string;
            title: string;
          }>;

        // Get evaluations for this evaluator
        const evaluations = await Evaluation.find({
          evaluatorId: evaluator._id,
        }).lean();

        // Calculate progress for each problem statement
        const problemStatementProgress = await Promise.all(
          assignedPS.map(async (ps) => {
            // Count total teams for this problem statement
            const totalTeams = await Team.countDocuments({
              problemStatement: ps._id,
              status: { $ne: "rejected" },
            });

            // Find evaluation for this problem statement
            const evaluation = evaluations.find(
              (evaluation) =>
                evaluation.problemStatementId.toString() === ps._id.toString()
            );

            return {
              problemStatement: ps,
              totalTeams,
              isEvaluated: !!evaluation,
              isFinalized: evaluation?.isFinalized || false,
              submittedAt: evaluation?.submittedAt,
              rankedTeams: evaluation?.rankings?.length || 0,
            };
          })
        );

        // Calculate overall progress
        const totalAssignments = assignedPS.length;
        const completedEvaluations = problemStatementProgress.filter(
          (ps) => ps.isFinalized
        ).length;
        const draftEvaluations = problemStatementProgress.filter(
          (ps) => ps.isEvaluated && !ps.isFinalized
        ).length;

        return {
          _id: evaluator._id,
          email: evaluator.email,
          isActive: evaluator.isActive,
          createdAt: evaluator.createdAt,
          totalAssignments,
          completedEvaluations,
          draftEvaluations,
          progressPercentage:
            totalAssignments > 0
              ? Math.round((completedEvaluations / totalAssignments) * 100)
              : 0,
          problemStatements: problemStatementProgress,
        };
      })
    );

    return NextResponse.json({
      success: true,
      evaluators: evaluatorsWithProgress,
    });
  } catch (error) {
    console.error("Get evaluator rankings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch evaluator rankings" },
      { status: 500 }
    );
  }
}
