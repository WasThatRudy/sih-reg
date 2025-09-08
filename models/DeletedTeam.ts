import mongoose, { Document, Schema, Model } from "mongoose";
import { ITeamMember, ITaskSubmission } from "./Team";

// Deleted Team Interface
export interface IDeletedTeam extends Document {
  _id: string;
  // Original team data
  originalTeamId: string;
  teamName: string;
  leader: {
    _id: string;
    email: string;
    name: string;
    phone?: string;
    gender?: string;
    college?: string;
    year?: string;
    branch?: string;
    firebaseUid?: string;
  };
  members: ITeamMember[];
  problemStatement: {
    _id: string;
    psNumber: string;
    title: string;
    domain: string;
  };
  status: "registered" | "selected" | "rejected" | "finalist";
  tasks: ITaskSubmission[];
  registrationDate: Date;
  // Deletion metadata
  deletedAt: Date;
  deletedBy: string; // Admin ID who deleted the team
  reason: string;
  originalCreatedAt: Date;
  originalUpdatedAt: Date;
}

// Team Member Schema (reused from Team model)
const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// Task Submission Schema (reused from Team model)
const taskSubmissionSchema = new Schema<ITaskSubmission>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    files: [
      {
        type: String,
      },
    ],
    textResponse: {
      type: String,
    },
    status: {
      type: String,
      enum: ["submitted", "reviewed", "approved", "rejected"],
      default: "submitted",
    },
    feedback: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

// Deleted Team Schema
const deletedTeamSchema = new Schema<IDeletedTeam>(
  {
    originalTeamId: {
      type: String,
      required: true,
      index: true,
    },
    teamName: {
      type: String,
      required: true,
      trim: true,
    },
    leader: {
      _id: { type: String, required: true },
      email: { type: String, required: true },
      name: { type: String, required: true },
      phone: { type: String },
      gender: { type: String },
      college: { type: String },
      year: { type: String },
      branch: { type: String },
      firebaseUid: { type: String },
    },
    members: {
      type: [teamMemberSchema],
      required: true,
    },
    problemStatement: {
      _id: { type: String, required: true },
      psNumber: { type: String, required: true },
      title: { type: String, required: true },
      domain: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["registered", "selected", "rejected", "finalist"],
      required: true,
    },
    tasks: [taskSubmissionSchema],
    registrationDate: {
      type: Date,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    deletedBy: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      default: "Suspected fake or duplicate registration",
    },
    originalCreatedAt: {
      type: Date,
      required: true,
    },
    originalUpdatedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: false, // We're managing timestamps manually
  }
);

// Add index for better query performance
deletedTeamSchema.index({ deletedAt: -1 });
deletedTeamSchema.index({ "leader.email": 1 });
deletedTeamSchema.index({ teamName: 1 });

export const DeletedTeam: Model<IDeletedTeam> =
  mongoose.models.DeletedTeam ||
  mongoose.model<IDeletedTeam>("DeletedTeam", deletedTeamSchema);
