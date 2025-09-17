import mongoose, { Document, Schema, Model, Types } from "mongoose";
import bcrypt from "bcrypt";

// Admin Interface
export interface IAdmin extends Document {
  _id: string;
  email: string;
  passwordHash: string;
  role: "super-admin" | "evaluator";
  assignedProblemStatements: Types.ObjectId[]; // Only for evaluators
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Extend interface for methods
export interface IAdminMethods {
  comparePassword(password: string): Promise<boolean>;
}

export type IAdminModel = Model<IAdmin, object, IAdminMethods>;

// Admin Schema
const adminSchema = new Schema<IAdmin, IAdminModel, IAdminMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["super-admin", "evaluator"],
      default: "evaluator",
    },
    assignedProblemStatements: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProblemStatement",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add method to compare passwords
adminSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  if (!this.passwordHash) {
    return false;
  }
  return bcrypt.compare(password, this.passwordHash);
};

export const Admin: IAdminModel =
  mongoose.models.Admin ||
  mongoose.model<IAdmin, IAdminModel>("Admin", adminSchema);
