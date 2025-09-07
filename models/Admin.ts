import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";

// Admin Interface
export interface IAdmin extends Document {
  _id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extend interface for methods
export interface IAdminMethods {
  comparePassword(password: string): Promise<boolean>;
}

export interface IAdminModel extends Model<IAdmin, {}, IAdminMethods> {}

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
