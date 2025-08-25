import mongoose, { Document, Schema, Model } from "mongoose";

// User Interface
export interface IUser extends Document {
  _id: string;
  email: string;
  name: string;
  role: "leader" | "admin";
  firebaseUid: string;
  team?: string; // Reference to Team document
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const userSchema = new Schema<IUser>(
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
      required: true,
      unique: true,
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

// Create indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
