import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICoachProfile extends Document {
  userId: Types.ObjectId;
  dateOfBirth: Date;
  address?: string;
  fideId: string;
  fideRating: number;
  cvUrl?: string;
  bio?: string;
  specializations: string[];
  coachAchievements: string[];
  playerAchievements: string[];
  verificationStatus: "pending" | "approved" | "rejected" | "paused";
  verificationNotes?: string;
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
  bankDetails?: {
    accountOwnerName: string;
    bankName: string;
    bankLocation: string;
    accountNumber: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CoachProfileSchema = new Schema<ICoachProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      trim: true,
    },
    fideId: {
      type: String,
      required: true,
      trim: true,
    },
    fideRating: {
      type: Number,
      required: true,
    },
    cvUrl: {
      type: String,
    },
    bio: {
      type: String,
      trim: true,
    },
    specializations: {
      type: [String],
      default: [],
    },
    coachAchievements: {
      type: [String],
      default: [],
    },
    playerAchievements: {
      type: [String],
      default: [],
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "paused"],
      default: "pending",
    },
    verificationNotes: {
      type: String,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    bankDetails: {
      accountOwnerName: { type: String, trim: true },
      bankName: { type: String, trim: true },
      bankLocation: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  },
);

const CoachProfile: Model<ICoachProfile> =
  mongoose.models.CoachProfile ||
  mongoose.model<ICoachProfile>("CoachProfile", CoachProfileSchema);

export default CoachProfile;
