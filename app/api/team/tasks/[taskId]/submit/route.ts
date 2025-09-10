import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { Task } from "@/models/Task";
import { Team } from "@/models/Team";
import { uploadToCloudinary } from "@/lib/utils/cloudinary";
import { validateFile } from "@/lib/utils/validation";
import dbConnect from "@/lib/mongodb";
import { Types } from "mongoose";

// POST /api/team/tasks/[taskId]/submit - Submit a task
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;

    // Authenticate team leader
    const authenticatedRequest = await verifyAuth(request);
    const user = authenticatedRequest.user;

    if (!user || user.role !== "leader") {
      return NextResponse.json(
        { success: false, error: "Team leader authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find the team for this leader
    const team = await Team.findOne({ leader: user._id });
    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // Check if task is assigned to this team
    const isAssigned = task.assignedTo.some(
      (teamId) => teamId.toString() === team._id.toString()
    );

    if (!isAssigned) {
      return NextResponse.json(
        { success: false, error: "Task not assigned to your team" },
        { status: 403 }
      );
    }

    // Check if task is still active
    if (!task.isActive) {
      return NextResponse.json(
        { success: false, error: "Task is no longer active" },
        { status: 400 }
      );
    }

    // Check if due date has passed
    if (task.dueDate && new Date() > task.dueDate) {
      return NextResponse.json(
        { success: false, error: "Task submission deadline has passed" },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const submissionData: Record<string, string | number> = {};
    const uploadedFiles: string[] = [];

    // Process each field
    for (const field of task.fields) {
      const fieldValue = formData.get(field.label);

      if (field.required && (!fieldValue || fieldValue === "")) {
        return NextResponse.json(
          { success: false, error: `Field '${field.label}' is required` },
          { status: 400 }
        );
      }

      if (field.type === "file" && fieldValue instanceof File) {
        // Validate file using field-specific restrictions
        const validation = validateFile(
          {
            size: fieldValue.size,
            type: fieldValue.type,
            name: fieldValue.name,
          },
          {
            maxSizeInMB: field.maxSize || 10,
            allowedFormats:
              field.acceptedFormats && field.acceptedFormats.length > 0
                ? field.acceptedFormats
                : ["pdf", "ppt", "pptx", "doc", "docx"], // Default formats
          }
        );

        if (!validation.isValid) {
          return NextResponse.json(
            {
              success: false,
              error: `File '${field.label}': ${validation.error}`,
            },
            { status: 400 }
          );
        }

        // Upload file to Cloudinary
        try {
          // Convert File to Buffer
          const fileBuffer = Buffer.from(await fieldValue.arrayBuffer());

          const uploadResult = await uploadToCloudinary(
            fileBuffer,
            "task-submissions"
          );
          submissionData[field.label] = uploadResult.secure_url;
          uploadedFiles.push(uploadResult.secure_url);
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          return NextResponse.json(
            { success: false, error: "Failed to upload file" },
            { status: 500 }
          );
        }
      } else if (fieldValue) {
        // Handle other field types
        const fieldValueString = fieldValue.toString();

        // Validate text length for text and textarea fields
        if (
          (field.type === "text" || field.type === "textarea") &&
          field.maxLength
        ) {
          if (fieldValueString.length > field.maxLength) {
            return NextResponse.json(
              {
                success: false,
                error: `Field '${field.label}' exceeds maximum length of ${field.maxLength} characters`,
              },
              { status: 400 }
            );
          }
        }

        submissionData[field.label] = fieldValueString;
      }
    }

    // Check if team has already submitted this task
    const existingSubmissionIndex = team.tasks.findIndex(
      (sub) => sub.taskId.toString() === taskId
    );

    const submission = {
      taskId: new Types.ObjectId(taskId),
      submittedAt: new Date(),
      files: uploadedFiles,
      data: submissionData,
      status: "submitted" as const,
    };

    if (existingSubmissionIndex >= 0) {
      // Update existing submission
      team.tasks[existingSubmissionIndex] = submission;
    } else {
      // Add new submission
      team.tasks.push(submission);
    }

    await team.save();

    return NextResponse.json({
      success: true,
      message: "Task submitted successfully",
      submission: {
        taskId,
        submittedAt: submission.submittedAt,
        status: submission.status,
      },
    });
  } catch (error: unknown) {
    console.error("Task submission error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to submit task" },
      { status: 500 }
    );
  }
}

// GET /api/team/tasks/[taskId]/submit - Get submission details for a specific task
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;

    // Authenticate team leader
    const authenticatedRequest = await verifyAuth(request);
    const user = authenticatedRequest.user;

    if (!user || user.role !== "leader") {
      return NextResponse.json(
        { success: false, error: "Team leader authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find the team for this leader
    const team = await Team.findOne({ leader: user._id });
    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // Find the submission
    const submission = team.tasks.find(
      (sub) => sub.taskId.toString() === taskId
    );

    return NextResponse.json({
      success: true,
      task: {
        _id: task._id,
        title: task.title,
        description: task.description,
        fields: task.fields,
        dueDate: task.dueDate,
      },
      submission: submission || null,
    });
  } catch (error: unknown) {
    console.error("Get task submission error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to get task submission" },
      { status: 500 }
    );
  }
}
