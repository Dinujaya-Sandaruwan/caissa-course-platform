import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

async function backfillPlatformFees() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in .env.local");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Define schema minimally to connect to existing collection
  const courseSchema = new mongoose.Schema(
    {
      title: String,
      platformFee: { type: Number },
    },
    { collection: "courses" },
  );
  const Course =
    mongoose.models.Course || mongoose.model("Course", courseSchema);

  console.log(
    "Looking for courses with platformFee undefined or less than 5...",
  );

  // Find courses where platformFee is not set OR less than 5
  const coursesToUpdate = await Course.find({
    $or: [{ platformFee: { $exists: false } }, { platformFee: { $lt: 5 } }],
  });

  console.log(`Found ${coursesToUpdate.length} courses to update.`);

  let updatedCount = 0;
  for (const course of coursesToUpdate) {
    course.platformFee = 30; // Set default to 30%
    await course.save();
    updatedCount++;
    console.log(`Updated course: "${course.title}" to 30% platform fee.`);
  }

  console.log(
    `\nMigration complete. Successfully backfilled ${updatedCount} courses.`,
  );
  mongoose.connection.close();
}

backfillPlatformFees().catch((err) => {
  console.error(err);
  process.exit(1);
});
