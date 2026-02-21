import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTPSession extends Document {
  whatsappNumber: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const OTPSessionSchema = new Schema<IOTPSession>({
  whatsappNumber: {
    type: String,
    required: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 },
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const OTPSession: Model<IOTPSession> =
  mongoose.models.OTPSession ||
  mongoose.model<IOTPSession>("OTPSession", OTPSessionSchema);

export default OTPSession;
