import mongoose, { Document, Schema, Model, Types } from "mongoose";

// Team Ranking Interface for a specific evaluator
export interface ITeamRanking {
  teamId: Types.ObjectId;
  rank: number; // 1=best, 2=second, etc.
  score?: number; // Optional scoring out of 100
  comments?: string; // Evaluator's comments
  evaluatedAt: Date;
}

// Evaluation Interface - One evaluation per problem statement per evaluator
export interface IEvaluation extends Document {
  _id: Types.ObjectId;
  problemStatementId: Types.ObjectId;
  evaluatorId: Types.ObjectId;
  rankings: ITeamRanking[];
  isFinalized: boolean;
  submittedAt?: Date;
  totalTeams: number; // Total teams being evaluated
  createdAt: Date;
  updatedAt: Date;
}

// Team Ranking Schema
const teamRankingSchema = new Schema<ITeamRanking>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    comments: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

// Evaluation Schema
const evaluationSchema = new Schema<IEvaluation>(
  {
    problemStatementId: {
      type: Schema.Types.ObjectId,
      ref: "ProblemStatement",
      required: true,
    },
    evaluatorId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    rankings: {
      type: [teamRankingSchema],
      required: true,
      validate: {
        validator: function (rankings: ITeamRanking[]) {
          // Check that ranks are unique and sequential (1, 2, 3, etc.)
          const ranks = rankings.map((r) => r.rank).sort((a, b) => a - b);
          for (let i = 0; i < ranks.length; i++) {
            if (ranks[i] !== i + 1) {
              return false;
            }
          }
          return true;
        },
        message:
          "Rankings must be sequential starting from 1 with no duplicates",
      },
    },
    isFinalized: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
    },
    totalTeams: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for unique evaluator-problem statement combinations
evaluationSchema.index(
  { problemStatementId: 1, evaluatorId: 1 },
  { unique: true }
);

// Create indexes for better performance
evaluationSchema.index({ evaluatorId: 1 });
evaluationSchema.index({ problemStatementId: 1 });
evaluationSchema.index({ isFinalized: 1 });

// Pre-save middleware to set submittedAt when finalized
evaluationSchema.pre("save", function (next) {
  if (this.isFinalized && !this.submittedAt) {
    this.submittedAt = new Date();
  }
  next();
});

export const Evaluation: Model<IEvaluation> =
  mongoose.models.Evaluation ||
  mongoose.model<IEvaluation>("Evaluation", evaluationSchema);
