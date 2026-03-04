import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAuditLog extends Document {
  managerId: Types.ObjectId;
  managerName: string;
  action: string;
  category:
    | "categories"
    | "coaches"
    | "courses"
    | "enrollments"
    | "students"
    | "managers"
    | "messages"
    | "payments"
    | "platform-fees";
  targetId?: string;
  targetName?: string;
  details?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    managerName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "categories",
        "coaches",
        "courses",
        "enrollments",
        "students",
        "managers",
        "messages",
        "payments",
        "platform-fees",
      ],
      required: true,
      index: true,
    },
    targetId: String,
    targetName: String,
    details: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

AuditLogSchema.index({ createdAt: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
