import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IEnrollment extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  receiptImageUrl?: string;
  referenceNumber?: string;
  amountPaid?: number;
  paymentStatus: "pending_review" | "approved" | "rejected" | "on_hold";
  reviewNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  enrolledAt?: Date;
  coachPayoutStatus: "pending" | "paid";
  coachPaidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    receiptImageUrl: {
      type: String,
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    amountPaid: {
      type: Number,
    },
    paymentStatus: {
      type: String,
      enum: ["pending_review", "approved", "rejected", "on_hold"],
      default: "pending_review",
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
    enrolledAt: {
      type: Date,
    },
    coachPayoutStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
      index: true,
    },
    coachPaidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

EnrollmentSchema.index({ studentId: 1, courseId: 1 });
EnrollmentSchema.index({ coachPayoutStatus: 1, paymentStatus: 1 });

const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);

export default Enrollment;
