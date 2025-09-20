import mongoose, { Document, Schema, Model, Types } from "mongoose";

// PPT Evaluation Schema
const pptEvaluationSchema = new Schema(
  {
    teamName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    problemStatement: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    evaluationResult: {
      type: Object,
      required: true,
    },
    pptLinks: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// Define the document interface
export interface IPptEvaluation extends Document {
  teamName: string;
  problemStatement: string;
  evaluationResult: object;
  pptLinks: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const PptEvaluation: Model<IPptEvaluation> =
  mongoose.models.PptEvaluation ||
  mongoose.model<IPptEvaluation>("PptEvaluation", pptEvaluationSchema);
