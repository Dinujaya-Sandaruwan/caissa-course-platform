import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ILesson extends Document {
  chapterId: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  order: number;
  duration?: number;
  description?: string;
  links?: string[];
  materials?: { title: string; url: string }[];
  bunnyVideoId?: string;
  videoStatus: "pending" | "processing" | "ready";
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
    },
    description: {
      type: String,
      trim: true,
    },
    links: [
      {
        type: String,
        trim: true,
      },
    ],
    materials: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    bunnyVideoId: {
      type: String,
      default: null,
    },
    videoStatus: {
      type: String,
      enum: ["pending", "processing", "ready"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const Lesson: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>("Lesson", LessonSchema);

export default Lesson;
