import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";
import { Admin } from "@/models/Admin";
import dbConnect from "@/lib/mongodb";

// GET /api/admin/evaluators/[evaluatorId]/assignments - Get specific evaluator's assignments
export async function GET(
  request: NextRequest,
  { params }: { params: { evaluatorId: string } }
) {
  try {
    // Verify admin authentication
    const authenticatedRequest = await verifyAdminAuth(request);

    await dbConnect();

    const currentAdmin = await Admin.findById(authenticatedRequest.admin?._id);
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    // Allow access if:
    // 1. Current user is super admin (can view any evaluator's assignments)
    // 2. Current user is the evaluator requesting their own assignments
    const { evaluatorId } = params;
    if (
      currentAdmin.role !== "super-admin" &&
      currentAdmin._id.toString() !== evaluatorId
    ) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // Get the evaluator with their assignments
    const evaluator = await Admin.findById(evaluatorId)
      .populate("assignedProblemStatements", "_id title")
      .select("email assignedProblemStatements role");

    if (!evaluator || evaluator.role !== "evaluator") {
      return NextResponse.json(
        { success: false, error: "Evaluator not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assignments: evaluator.assignedProblemStatements,
      evaluator: {
        _id: evaluator._id,
        email: evaluator.email,
      },
    });
  } catch (error: unknown) {
    console.error("Get evaluator assignments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch evaluator assignments" },
      { status: 500 }
    );
  }
}
