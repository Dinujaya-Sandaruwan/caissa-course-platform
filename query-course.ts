import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error("No URI"); process.exit(1); }

async function run() {
  await mongoose.connect(MONGO_URI!);
  const Course = mongoose.models.Course || mongoose.model("Course", new mongoose.Schema({}), "courses");
  
  // Find the exact course seen in his screenshot: "Test Course by Dinujaya"
  const course = await Course.findOne({ title: "Test Course by Dinujaya" }).lean();
  console.log("Course Found:", !!course);
  if (course) {
     console.log("Course ID:", course._id);
     console.log("Course Thumbnail URL:", course.thumbnailUrl);
     console.log("Original Thumbnail URL:", course.thumbnailOriginalUrl);
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
