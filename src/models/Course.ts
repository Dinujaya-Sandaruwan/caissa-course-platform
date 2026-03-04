import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICourse extends Document {
  coach: Types.ObjectId;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  thumbnailOriginalUrl?: string;
  previewVideoUrl?: string;
  tempPreviewVideoPath?: string;
  allowDiscounts: boolean;
  maxDiscountPercent: number;
  discountedPrice?: number;
  level: "beginner" | "intermediate" | "advanced";
  tags: string[];
  category?: Types.ObjectId;
  durationHours: number;
  durationMinutes: number;
  status:
    | "draft"
    | "pending_review"
    | "approved"
    | "rejected"
    | "published"
    | "unpublished"
    | "trashed";
  trashedAt?: Date;
  reviewNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  enrollmentCount: number;
  platformFee: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    coach: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    thumbnailOriginalUrl: {
      type: String,
    },
    previewVideoUrl: {
      type: String,
    },
    tempPreviewVideoPath: {
      type: String,
    },
    allowDiscounts: {
      type: Boolean,
      default: false,
    },
    maxDiscountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountedPrice: {
      type: Number,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    durationHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
      max: 59,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "pending_review",
        "approved",
        "rejected",
        "published",
        "unpublished",
        "trashed",
      ],
      default: "draft",
      index: true,
    },
    trashedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 40,
      min: 5,
      max: 100,
    },
  },
  {
    timestamps: true,
  },
);

CourseSchema.index({ title: "text", description: "text" });

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
