import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPayoutBreakdownItem {
  courseId: Types.ObjectId;
  courseTitle: string;
  enrollmentCount: number;
  grossRevenue: number;
  platformFeePercent: number;
  platformCut: number;
  coachCut: number;
}

export interface IPayoutRequest extends Document {
  coachId: Types.ObjectId;
  managerId: Types.ObjectId;
  status: "pending_coach" | "coach_approved" | "coach_rejected" | "paid";
  totalAmount: number;
  breakdown: IPayoutBreakdownItem[];
  enrollmentIds: Types.ObjectId[];
  coachNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutBreakdownItemSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    courseTitle: { type: String, required: true },
    enrollmentCount: { type: Number, required: true },
    grossRevenue: { type: Number, required: true },
    platformFeePercent: { type: Number, required: true },
    platformCut: { type: Number, required: true },
    coachCut: { type: Number, required: true },
  },
  { _id: false },
);

const PayoutRequestSchema = new Schema<IPayoutRequest>(
  {
    coachId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending_coach", "coach_approved", "coach_rejected", "paid"],
      default: "pending_coach",
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    breakdown: [PayoutBreakdownItemSchema],
    enrollmentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Enrollment",
      },
    ],
    coachNote: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

PayoutRequestSchema.index({ coachId: 1, status: 1 });

const PayoutRequest: Model<IPayoutRequest> =
  mongoose.models.PayoutRequest ||
  mongoose.model<IPayoutRequest>("PayoutRequest", PayoutRequestSchema);

export default PayoutRequest;
