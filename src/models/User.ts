import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  whatsappNumber: string;
  name: string;
  nickname?: string;
  email?: string;
  username?: string;
  password?: string;
  role: "student" | "coach" | "manager";
  status: "active" | "suspended";
  profilePhoto?: string;
  profilePhotoThumbnail?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    whatsappNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nickname: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Only unique if it exists
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["student", "coach", "manager"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    profilePhoto: {
      type: String,
    },
    profilePhotoThumbnail: {
      type: String,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
