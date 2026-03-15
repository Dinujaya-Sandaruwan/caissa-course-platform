import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error("No URI"); process.exit(1); }

async function run() {
  await mongoose.connect(MONGO_URI!);
  console.log("Connected");
  
  const Course = mongoose.models.Course || mongoose.model("Course", new mongoose.Schema({}), "courses");
  const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", new mongoose.Schema({}), "lessons");
  
  const courseId = "69afcfe206c7719a46cf327d";
  
  // Wait, 69afcfe206c7719a46cf327d is 24 hex characters. Let's check if it exists:
  const course = await Course.findById(courseId).lean();
  console.log("Course:", course ? course.title : "Not Found");
  
  if (course) {
    const lessons = await Lesson.find({ courseId: new mongoose.Types.ObjectId(courseId) }).lean();
    console.log("Lessons:", lessons.length);
    for (const l of lessons) {
      console.log(l._id, l.title, "| videoId:", l.bunnyVideoId, "| status:", l.videoStatus);
    }
  }
  await mongoose.disconnect();
}

run().catch(console.error);
