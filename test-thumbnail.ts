import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGO_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGO_URI!);
  const Course = mongoose.models.Course || mongoose.model("Course", new mongoose.Schema({}, { strict: false }), "courses");
  
  const cid = "69afcfe206c7719a46cf327d"; // Specific course ID checked earlier
  const course = await Course.findById(cid).lean();
  console.log("Course Thumbnail URL:", course?.thumbnailUrl);
  console.log("Original Thumbnail URL:", course?.thumbnailOriginalUrl);

  await mongoose.disconnect();
}

run().catch(console.error);
