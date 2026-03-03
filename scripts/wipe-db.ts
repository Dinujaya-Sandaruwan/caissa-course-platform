import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env.local or .env
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing in environment variables.");
  process.exit(1);
}

// Import all models explicitly to guarantee schema alignment
import Chapter from "../src/models/Chapter";
import CoachProfile from "../src/models/CoachProfile";
import Course from "../src/models/Course";
import Enrollment from "../src/models/Enrollment";
import Lesson from "../src/models/Lesson";
import Notification from "../src/models/Notification";
import OTPSession from "../src/models/OTPSession";
import Progress from "../src/models/Progress";
import StudentProfile from "../src/models/StudentProfile";
import Tag from "../src/models/Tag";
import User from "../src/models/User";

async function wipeDatabase() {
  console.log("⚠️  Connecting to database...");
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ Connected securely.");

    console.log("🗑️  Purging collections...");

    // Delete everything in all standard related collections
    await Promise.all([
      Chapter.deleteMany({}),
      CoachProfile.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({}),
      Lesson.deleteMany({}),
      Notification.deleteMany({}),
      OTPSession.deleteMany({}),
      Progress.deleteMany({}),
      StudentProfile.deleteMany({}),
      Tag.deleteMany({}),
    ]);
    console.log(
      "✅ Wiped tertiary tables: Chapters, Profiles, Courses, Enrollments, Lessons, Notifications, OTPs, Progress, Tags",
    );

    // Conditionally wipe Users to preserve Managers
    const userDeleteResult = await User.deleteMany({
      role: { $ne: "manager" },
    });
    console.log(
      `✅ Purged Users: Deleted ${userDeleteResult.deletedCount} non-manager accounts.`,
    );

    console.log("🎉 Database wipe complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal error during wiping process:", error);
    process.exit(1);
  }
}

wipeDatabase();
