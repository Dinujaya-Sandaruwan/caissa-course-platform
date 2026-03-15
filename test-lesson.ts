import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGO_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGO_URI!);
  const Course = mongoose.models.Course || mongoose.model("Course", new mongoose.Schema({}, { strict: false }), "courses");
  const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", new mongoose.Schema({}, { strict: false }), "lessons");
  
  const course = await Course.findOne({ title: { $regex: /Test Course by Dinujaya/i } }).lean();
  if (course) {
    console.log("Course found:", course._id);
    const lessons = await Lesson.find({ courseId: course._id }).lean();
    console.log(`Found ${lessons.length} lessons`);
    lessons.forEach(l => {
        console.log(`- Lesson: ${l.title}`);
        console.log(`  _id: ${l._id}`);
        console.log(`  bunnyVideoId: ${l.bunnyVideoId}`);
        console.log(`  videoStatus: ${l.videoStatus}`);
    });
  } else {
    console.log("Course not found!");
  }

  await mongoose.disconnect();
}


const Mtch(console.error);
