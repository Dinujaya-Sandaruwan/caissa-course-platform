import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IStudentProfile extends Document {
  userId: Types.ObjectId;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  fideId?: string;
  skillLevel: "beginner" | "intermediate" | "advanced" | "expert";
  city?: string;
  preferredLanguage: "en" | "si" | "ta";
  parentName?: string;
  parentDateOfBirth?: Date;
  totalCoursesCompleted: number;
  totalStudyHours: number;
  referredBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    fideId: {
      type: String,
      trim: true,
    },
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "beginner",
    },
    city: {
      type: String,
      trim: true,
    },
    preferredLanguage: {
      type: String,
      enum: ["en", "si", "ta"],
      default: "en",
    },
    parentName: {
      type: String,
      trim: true,
    },
    parentDateOfBirth: {
      type: Date,
    },
    totalCoursesCompleted: {
      type: Number,
      default: 0,
    },
    totalStudyHours: {
      type: Number,
      default: 0,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const StudentProfile: Model<IStudentProfile> =
  mongoose.models.StudentProfile ||
  mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema);

export default StudentProfile;
