import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITag extends Document {
  name: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    usageCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

// Index for fast autocomplete search
TagSchema.index({ name: 1 });

const Tag: Model<ITag> =
  mongoose.models.Tag || mongoose.model<ITag>("Tag", TagSchema);

export default Tag;
