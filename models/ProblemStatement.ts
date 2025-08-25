import mongoose, { Document, Schema, Model } from "mongoose";

// Problem Statement Interface
export interface IProblemStatement extends Document {
  _id: string;
  psNumber: string;
  title: string;
  description: string;
  domain: string;
  link: string;
  teamCount: number;
  maxTeams: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Problem Statement Schema
const problemStatementSchema = new Schema<IProblemStatement>(
  {
    psNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    teamCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxTeams: {
      type: Number,
      default: 3,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
problemStatementSchema.index({ psNumber: 1 });
problemStatementSchema.index({ isActive: 1, teamCount: 1 });

export const ProblemStatement: Model<IProblemStatement> =
  mongoose.models.ProblemStatement ||
  mongoose.model<IProblemStatement>("ProblemStatement", problemStatementSchema);
