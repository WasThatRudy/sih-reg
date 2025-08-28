import mongoose, { Document, Schema, Model, Types } from "mongoose";

// Team Member Interface
export interface ITeamMember {
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  college: string;
  year: string;
  branch: string;
}

// Task Submission Interface
export interface ITaskSubmission {
  taskId: Types.ObjectId;
  submittedAt: Date;
  files?: string[]; // Cloudinary URLs
  textResponse?: string;
  status: "submitted" | "reviewed" | "approved" | "rejected";
  feedback?: string;
}

// Team Interface
export interface ITeam extends Document {
  _id: Types.ObjectId;
  teamName: string;
  leader: Types.ObjectId; // Reference to User document
  members: ITeamMember[];
  problemStatement: Types.ObjectId; // Reference to ProblemStatement document
  status: "registered" | "selected" | "rejected" | "finalist";
  tasks: ITaskSubmission[];
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Team Member Schema
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
    _id: false, // Don't create _id for subdocuments
  }
);

// Task Submission Schema
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
        type: String, // Cloudinary URLs
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

// Team Schema
const teamSchema = new Schema<ITeam>(
  {
    teamName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    leader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: {
      type: [teamMemberSchema],
      required: true,
      validate: {
        validator: function (members: ITeamMember[]) {
          return members.length === 5;
        },
        message: "Team must have exactly 5 members",
      },
    },
    problemStatement: {
      type: Schema.Types.ObjectId,
      ref: "ProblemStatement",
      required: true,
    },
    status: {
      type: String,
      enum: ["registered", "selected", "rejected", "finalist"],
      default: "registered",
    },
    tasks: [taskSubmissionSchema],
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Custom validation for gender diversity
teamSchema.pre("save", function (next) {
  const hasFemaleMember = this.members.some(
    (member: ITeamMember) => member.gender === "female"
  );

  if (!hasFemaleMember) {
    const error = new Error("Team must have at least one female member");
    return next(error);
  }

  next();
});

export const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", teamSchema);
