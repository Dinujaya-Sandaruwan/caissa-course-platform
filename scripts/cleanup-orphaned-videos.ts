/**
 * Orphaned Bunny.net Video Cleanup Script
 *
 * Finds videos on Bunny Stream that are NOT referenced by any Lesson or Course
 * in the database and deletes them — but ONLY if they are older than 24 hours
 * (to protect videos that are currently being uploaded/processed).
 *
 * Usage:
 *   npx tsx scripts/cleanup-orphaned-videos.ts              # Dry-run (safe preview)
 *   npx tsx scripts/cleanup-orphaned-videos.ts --delete      # Actually delete orphans
 *   npx tsx scripts/cleanup-orphaned-videos.ts --hours 48    # Custom grace period
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

// ── Config ──────────────────────────────────────────────────────────────────
const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY!;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID!;
const MONGODB_URI = process.env.MONGODB_URI!;

if (!BUNNY_STREAM_API_KEY || !BUNNY_LIBRARY_ID || !MONGODB_URI) {
  console.error(
    "❌ Missing required env vars: BUNNY_STREAM_API_KEY, BUNNY_LIBRARY_ID, MONGODB_URI",
  );
  process.exit(1);
}

// ── Parse CLI args ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const shouldDelete = args.includes("--delete");
const hoursIndex = args.indexOf("--hours");
const gracePeriodHours =
  hoursIndex !== -1 ? parseInt(args[hoursIndex + 1], 10) : 24;

if (isNaN(gracePeriodHours) || gracePeriodHours < 1) {
  console.error("❌ --hours must be a positive integer");
  process.exit(1);
}

// ── Bunny API helpers ───────────────────────────────────────────────────────
interface BunnyVideo {
  guid: string;
  title: string;
  dateUploaded: string;
  length: number;
  status: number;
  storageSize: number;
}

async function listAllBunnyVideos(): Promise<BunnyVideo[]> {
  const allVideos: BunnyVideo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos?page=${page}&itemsPerPage=${perPage}&orderBy=date`,
      {
        headers: {
          AccessKey: BUNNY_STREAM_API_KEY,
          Accept: "application/json",
        },
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bunny API error (page ${page}): ${text}`);
    }

    const data = await res.json();
    const items: BunnyVideo[] = data.items || [];

    if (items.length === 0) break;

    allVideos.push(...items);

    if (items.length < perPage) break; // Last page
    page++;
  }

  return allVideos;
}

async function deleteBunnyVideo(videoId: string): Promise<boolean> {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    {
      method: "DELETE",
      headers: { AccessKey: BUNNY_STREAM_API_KEY },
    },
  );
  return res.ok;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function run() {
  console.log("🐰 Bunny.net Orphaned Video Cleanup");
  console.log(
    `   Mode: ${shouldDelete ? "🔴 DELETE" : "🟢 DRY-RUN (safe preview)"}`,
  );
  console.log(`   Grace period: ${gracePeriodHours} hours`);
  console.log("");

  // 1. Connect to MongoDB
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const db = mongoose.connection.db!;

  // 2. Collect all known video IDs from the database
  const knownVideoIds = new Set<string>();

  // From Lessons
  const lessons = await db
    .collection("lessons")
    .find(
      { bunnyVideoId: { $ne: null, $exists: true } },
      { projection: { bunnyVideoId: 1 } },
    )
    .toArray();

  for (const lesson of lessons) {
    if (lesson.bunnyVideoId) {
      knownVideoIds.add(lesson.bunnyVideoId);
    }
  }

  // From Courses (preview videos)
  const courses = await db
    .collection("courses")
    .find(
      { bunnyPreviewVideoId: { $ne: null, $exists: true } },
      { projection: { bunnyPreviewVideoId: 1 } },
    )
    .toArray();

  for (const course of courses) {
    if (course.bunnyPreviewVideoId) {
      knownVideoIds.add(course.bunnyPreviewVideoId);
    }
  }

  console.log(
    `📊 Found ${knownVideoIds.size} video IDs referenced in the database`,
  );
  console.log(`   ├─ ${lessons.length} lesson videos`);
  console.log(`   └─ ${courses.length} course preview videos`);
  console.log("");

  // 3. List all videos from Bunny.net
  console.log("📡 Fetching all videos from Bunny.net...");
  const bunnyVideos = await listAllBunnyVideos();
  console.log(`   Found ${bunnyVideos.length} total videos on Bunny.net`);
  console.log("");

  // 4. Identify orphans (not in DB AND older than grace period)
  const cutoffDate = new Date(Date.now() - gracePeriodHours * 60 * 60 * 1000);
  const orphans: BunnyVideo[] = [];
  const recentOrphans: BunnyVideo[] = [];

  for (const video of bunnyVideos) {
    if (!knownVideoIds.has(video.guid)) {
      const uploadDate = new Date(video.dateUploaded);
      if (uploadDate < cutoffDate) {
        orphans.push(video);
      } else {
        recentOrphans.push(video);
      }
    }
  }

  const totalOrphanStorageMB =
    orphans.reduce((sum, v) => sum + v.storageSize, 0) / (1024 * 1024);

  console.log("📋 Results:");
  console.log(
    `   ├─ ${bunnyVideos.length - orphans.length - recentOrphans.length} videos are in use (referenced in DB)`,
  );
  console.log(
    `   ├─ ${recentOrphans.length} orphans skipped (uploaded within the last ${gracePeriodHours}h)`,
  );
  console.log(
    `   └─ ${orphans.length} orphans eligible for deletion (${totalOrphanStorageMB.toFixed(1)} MB)`,
  );
  console.log("");

  if (orphans.length === 0) {
    console.log("🎉 No orphaned videos to clean up. Storage is clean!");
    await mongoose.disconnect();
    return;
  }

  // 5. List orphans
  console.log("🗑️  Orphaned videos:");
  for (const video of orphans) {
    const uploadDate = new Date(video.dateUploaded);
    const ageHours = Math.round(
      (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60),
    );
    const sizeMB = (video.storageSize / (1024 * 1024)).toFixed(1);
    console.log(
      `   ├─ ${video.guid} | "${video.title}" | ${sizeMB} MB | ${ageHours}h old`,
    );
  }
  console.log("");

  // 6. Delete or preview
  if (shouldDelete) {
    console.log(`🔴 Deleting ${orphans.length} orphaned videos...`);
    let deleted = 0;
    let failed = 0;

    for (const video of orphans) {
      try {
        const ok = await deleteBunnyVideo(video.guid);
        if (ok) {
          deleted++;
          console.log(`   ✅ Deleted: ${video.guid} ("${video.title}")`);
        } else {
          failed++;
          console.log(`   ❌ Failed:  ${video.guid} ("${video.title}")`);
        }
      } catch (err) {
        failed++;
        console.log(`   ❌ Error:   ${video.guid} - ${err}`);
      }
    }

    console.log("");
    console.log(
      `🏁 Done! Deleted: ${deleted}, Failed: ${failed}, Storage freed: ~${totalOrphanStorageMB.toFixed(1)} MB`,
    );
  } else {
    console.log("🟢 DRY-RUN complete. No videos were deleted.");
    console.log(`   To actually delete, run with: --delete`);
    console.log(
      `   Example: npx tsx scripts/cleanup-orphaned-videos.ts --delete`,
    );
  }

  await mongoose.disconnect();
  console.log("✅ Disconnected from MongoDB");
}

run().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
