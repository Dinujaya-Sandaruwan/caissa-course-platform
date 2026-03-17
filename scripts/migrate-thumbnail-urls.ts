/**
 * Migration Script: Update existing thumbnail URLs from static to dynamic paths
 *
 * Changes:
 *   /uploads/courses/{id}/thumbnail-xxx.webp  →  /api/files/courses/{id}/thumbnail-xxx.webp
 *
 * This ensures existing course thumbnails work with the dynamic file serving route
 * instead of relying on Next.js static file serving from public/.
 *
 * Usage:
 *   DRY RUN:     npx tsx scripts/migrate-thumbnail-urls.ts
 *   APPLY:       npx tsx scripts/migrate-thumbnail-urls.ts --apply
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing in environment variables.");
  process.exit(1);
}

import Course from "../src/models/Course";

const DRY_RUN = !process.argv.includes("--apply");

function migrateUrl(url: string): string | null {
  if (!url) return null;
  // Already migrated
  if (url.startsWith("/api/files/")) return null;
  // Match /uploads/courses/... or ./public/uploads/courses/...
  const match = url.match(/(?:\/uploads\/|public\/uploads\/)(courses\/.+)$/);
  if (match) return `/api/files/${match[1]}`;
  return null;
}

async function migrate() {
  console.log(
    DRY_RUN ? "🔍 DRY RUN MODE (no changes will be made)\n" : "🚀 APPLY MODE\n"
  );

  console.log("📡 Connecting to database...");
  await mongoose.connect(MONGODB_URI!);
  console.log("✅ Connected\n");

  const courses = await Course.find({
    $or: [
      { thumbnailUrl: { $exists: true, $ne: null, $not: /^\/api\/files\// } },
      { thumbnailOriginalUrl: { $exists: true, $ne: null, $not: /^\/api\/files\// } },
    ],
  }).lean();

  console.log(`📝 Found ${courses.length} courses to migrate\n`);

  if (courses.length === 0) {
    console.log("✅ All courses already migrated — nothing to do!");
    await mongoose.disconnect();
    process.exit(0);
  }

  let updated = 0;
  let skipped = 0;

  for (const course of courses) {
    const newThumbUrl = migrateUrl(course.thumbnailUrl || "");
    const newOrigUrl = migrateUrl(course.thumbnailOriginalUrl || "");

    if (!newThumbUrl && !newOrigUrl) {
      skipped++;
      continue;
    }

    updated++;
    console.log(`  📸 "${course.title}"`);
    if (newThumbUrl) {
      console.log(`     thumbnailUrl: ${course.thumbnailUrl} → ${newThumbUrl}`);
    }
    if (newOrigUrl) {
      console.log(`     thumbnailOriginalUrl: ${course.thumbnailOriginalUrl} → ${newOrigUrl}`);
    }

    if (!DRY_RUN) {
      const updateFields: Record<string, string> = {};
      if (newThumbUrl) updateFields.thumbnailUrl = newThumbUrl;
      if (newOrigUrl) updateFields.thumbnailOriginalUrl = newOrigUrl;
      await Course.findByIdAndUpdate(course._id, { $set: updateFields });
      console.log(`     ✓ Updated`);
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log("SUMMARY");
  console.log("═".repeat(60));
  console.log(`  📸 Updated:  ${updated}`);
  console.log(`  ⏭️  Skipped:  ${skipped}`);
  console.log(`  📝 Total:    ${courses.length}`);

  if (DRY_RUN) {
    console.log(`\n💡 This was a DRY RUN. To apply changes, run:\n`);
    console.log(`   npx tsx scripts/migrate-thumbnail-urls.ts --apply\n`);
  } else {
    console.log(`\n🎉 Migration complete!\n`);
  }

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
