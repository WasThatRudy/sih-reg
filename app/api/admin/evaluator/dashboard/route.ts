import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";
import { Admin } from "@/models/Admin";
import { Team } from "@/models/Team";
import { Evaluation } from "@/models/Evaluation";
import { ProblemStatement } from "@/models/ProblemStatement";
import dbConnect from "@/lib/mongodb";

// Ensure models are registered
void ProblemStatement;

// GET /api/admin/evaluator/dashboard - Get evaluator's assigned problem statements and evaluation status
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authenticatedRequest = await verifyAdminAuth(request);

    await dbConnect();

    // Get the current evaluator
    const evaluator = await Admin.findById(
      authenticatedRequest.admin?._id
    ).populate("assignedProblemStatements", "title description psNumber");

    if (!evaluator) {
      return NextResponse.json(
        { success: false, error: "Evaluator not found" },
        { status: 404 }
      );
    }

    if (evaluator.role !== "evaluator") {
      return NextResponse.json(
        { success: false, error: "Access restricted to evaluators only" },
        { status: 403 }
      );
    }

    // Get evaluation status for each assigned problem statement
    const assignedPS = evaluator.assignedProblemStatements as unknown as Array<{
      _id: string;
      title: string;
      description?: string;
    }>;
    const evaluationStatuses = await Promise.all(
      assignedPS.map(async (ps) => {
        // Count total teams for this problem statement (all except rejected)
        const totalTeams = await Team.countDocuments({
          problemStatement: ps._id,
          status: { $ne: "rejected" }, // Count all teams except rejected ones
        });

        // Check if evaluation exists for this problem statement
        const evaluation = await Evaluation.findOne({
          problemStatementId: ps._id,
          evaluatorId: evaluator._id,
        });

        return {
          problemStatement: {
            _id: ps._id,
            title: ps.title,
            description: ps.description,
          },
          totalTeams,
          isEvaluated: !!evaluation,
          isFinalized: evaluation?.isFinalized || false,
          submittedAt: evaluation?.submittedAt,
          rankedTeams: evaluation?.rankings.length || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      evaluator: {
        _id: evaluator._id,
        email: evaluator.email,
        role: evaluator.role,
      },
      assignedProblemStatements: evaluationStatuses,
    });
  } catch (error: unknown) {
    console.error("Evaluator dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch evaluator dashboard" },
      { status: 500 }
    );
  }
}
