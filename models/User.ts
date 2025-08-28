import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";

// User Interface
export interface IUser extends Document {
  _id: string;
  email: string;
  name: string;
  role: "leader" | "admin";
  firebaseUid?: string; // Optional for admin users
  passwordHash?: string; // Only for admin users
  team?: string; // Reference to Team document
  createdAt: Date;
  updatedAt: Date;
}

// Extend interface for methods
export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser, {}, IUserMethods> {}

// User Schema
const userSchema = new Schema<IUser, IUserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["leader", "admin"],
      required: true,
      default: "leader",
    },
    firebaseUid: {
      type: String,
      required: function(this: IUser) {
        return this.role === "leader"; // Required only for team leaders
      },
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },
    passwordHash: {
      type: String,
      required: function(this: IUser) {
        return this.role === "admin"; // Required only for admin users
      },
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add method to compare passwords for admin users
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  if (!this.passwordHash) {
    return false;
  }
  return bcrypt.compare(password, this.passwordHash);
};

export const User: IUserModel =
  mongoose.models.User || mongoose.model<IUser, IUserModel>("User", userSchema);
