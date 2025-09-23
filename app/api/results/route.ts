import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import { Team } from "../../../models/Team";

// Import models to ensure they are registered with Mongoose
import "../../../models/User";
import "../../../models/ProblemStatement";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "selected";

    // Build aggregation pipeline to get teams with populated data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [
      // Match teams with the specified status
      { $match: { status } },

      // Lookup leader data
      {
        $lookup: {
          from: "users",
          localField: "leader",
          foreignField: "_id",
          as: "leader",
        },
      },
      { $unwind: "$leader" },

      // Lookup problem statement data
      {
        $lookup: {
          from: "problemstatements",
          localField: "problemStatement",
          foreignField: "_id",
          as: "problemStatement",
        },
      },
      { $unwind: "$problemStatement" },

      // Sort by registration date (most recent first)
      { $sort: { registrationDate: -1 } },

      // Project only necessary fields
      {
        $project: {
          _id: 1,
          teamName: 1,
          status: 1,
          registrationDate: 1,
          createdAt: 1,
          updatedAt: 1,
          memberCount: { $size: "$members" },
          "leader.name": 1,
          "leader.email": 1,
          "problemStatement.psNumber": 1,
          "problemStatement.title": 1,
          "problemStatement.description": 1,
          "problemStatement.domain": 1,
        },
      },
    ];

    // Execute aggregation
    const teams = await Team.aggregate(pipeline);

    // Group teams by problem statement for better organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teamsByPS = teams.reduce((acc: any, team: any) => {
      const psNumber = team.problemStatement.psNumber;
      if (!acc[psNumber]) {
        acc[psNumber] = {
          problemStatement: team.problemStatement,
          teams: [],
        };
      }
      acc[psNumber].teams.push(team);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      teams,
      teamsByPS,
      statistics: {
        totalSelectedTeams: teams.length,
        uniqueProblemStatements: Object.keys(teamsByPS).length,
      },
    });
  } catch (error: unknown) {
    console.error("Get results error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
