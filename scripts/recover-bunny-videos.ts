/**
 * Recovery Script: Restore wiped Bunny.net video references
 *
 * This script fixes lessons whose bunnyVideoId was incorrectly wiped
 * due to a bug that treated Bunny status 4 (Resolution finished) as an error.
 *
 * Matching strategy:
 * Bunny videos have titles like:
 *   "[Course: COURSE_NAME] - [Chapter N: CHAPTER_TITLE] - LESSON_TITLE"
 * The script parses these structured titles and matches by:
 *   1. Course name + Chapter title + Lesson title (exact)
 *   2. Course name + Chapter title + lesson position (by order)
 *
 * Usage:
 *   DRY RUN (preview only):  npx tsx scripts/recover-bunny-videos.ts
 *   APPLY CHANGES:           npx tsx scripts/recover-bunny-videos.ts --apply
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;
const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

if (!MONGODB_URI || !BUNNY_STREAM_API_KEY || !BUNNY_LIBRARY_ID) {
  console.error(
    "❌ Missing required env vars: MONGODB_URI, BUNNY_STREAM_API_KEY, BUNNY_LIBRARY_ID"
  );
  process.exit(1);
}

import Lesson from "../src/models/Lesson";
import Course from "../src/models/Course";
import Chapter from "../src/models/Chapter";

// Force-register schemas with mongoose
void Chapter;
void Course;

const DRY_RUN = !process.argv.includes("--apply");

interface BunnyVideo {
  guid: string;
  title: string;
  status: number;
  dateUploaded: string;
  length: number;
}

interface ParsedBunnyTitle {
  courseName: string;
  chapterTitle: string;
  lessonTitle: string;
}

/**
 * Parse a structured Bunny video title like:
 * "[Course: WIN MORE GAMES] - [Chapter 1: Fork] - Knight Fork 2"
 */
function parseBunnyTitle(title: string): ParsedBunnyTitle | null {
  const match = title.match(
    /^\[Course:\s*(.+?)\]\s*-\s*\[Chapter\s*\d+:\s*(.+?)\]\s*-\s*(.+)$/i
  );
  if (!match) return null;
  return {
    courseName: match[1].trim(),
    chapterTitle: match[2].trim(),
    lessonTitle: match[3].trim(),
  };
}

/**
 * Fetch all videos from the Bunny.net library (handles pagination)
 */
async function fetchAllBunnyVideos(): Promise<BunnyVideo[]> {
  const allVideos: BunnyVideo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos?page=${page}&itemsPerPage=${perPage}&orderBy=date`,
      {
        headers: {
          AccessKey: BUNNY_STREAM_API_KEY!,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Bunny API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    const items: BunnyVideo[] = data.items || [];
    allVideos.push(...items);

    if (items.length < perPage) break;
    page++;
  }

  return allVideos;
}

async function recover() {
  console.log(
    DRY_RUN ? "🔍 DRY RUN MODE (no changes will be made)\n" : "🚀 APPLY MODE\n"
  );

  // 1. Connect to MongoDB
  console.log("📡 Connecting to database...");
  await mongoose.connect(MONGODB_URI!);
  console.log("✅ Connected\n");

  // 2. Fetch all videos from Bunny.net
  console.log("📹 Fetching videos from Bunny.net...");
  const bunnyVideos = await fetchAllBunnyVideos();
  console.log(`   Found ${bunnyVideos.length} total videos in Bunny library`);

  // Filter to lesson videos only (not previews), and only playable ones
  const lessonVideos = bunnyVideos.filter((v) => {
    if (v.status !== 3 && v.status !== 4) return false;
    if (v.title.startsWith("[Preview]")) return false;
    return parseBunnyTitle(v.title) !== null;
  });
  console.log(`   ${lessonVideos.length} are lesson videos (playable)\n`);

  // 3. Fetch all courses, chapters, and orphaned lessons
  const courses = await Course.find({}).select("title").lean();
  const chapters = await Chapter.find({}).sort({ order: 1 }).lean();
  const orphanedLessons = await Lesson.find({
    $or: [
      { bunnyVideoId: null },
      { bunnyVideoId: { $exists: false } },
      { bunnyVideoId: "" },
    ],
  })
    .sort({ order: 1 })
    .lean();

  console.log(`📝 Found ${orphanedLessons.length} lessons without a video reference\n`);

  if (orphanedLessons.length === 0) {
    console.log("✅ No orphaned lessons found — nothing to recover!");
    await mongoose.disconnect();
    process.exit(0);
  }

  // Build lookup maps
  const courseMap = new Map(courses.map((c) => [c._id.toString(), c.title]));
  const chapterMap = new Map(
    chapters.map((ch) => [ch._id.toString(), ch])
  );

  // Build map: "courseName|chapterTitle|lessonTitle" -> BunnyVideo[]
  const bunnyByKey = new Map<string, BunnyVideo[]>();
  // Also build: "courseName|chapterTitle" -> BunnyVideo[] (ordered by upload date)
  const bunnyByChapter = new Map<string, BunnyVideo[]>();

  for (const video of lessonVideos) {
    const parsed = parseBunnyTitle(video.title);
    if (!parsed) continue;

    const exactKey =
      `${parsed.courseName.toLowerCase()}|${parsed.chapterTitle.toLowerCase()}|${parsed.lessonTitle.toLowerCase()}`;
    if (!bunnyByKey.has(exactKey)) bunnyByKey.set(exactKey, []);
    bunnyByKey.get(exactKey)!.push(video);

    const chapterKey =
      `${parsed.courseName.toLowerCase()}|${parsed.chapterTitle.toLowerCase()}`;
    if (!bunnyByChapter.has(chapterKey)) bunnyByChapter.set(chapterKey, []);
    bunnyByChapter.get(chapterKey)!.push(video);
  }

  // Sort chapter video arrays by upload date (oldest first = original order)
  for (const [, videos] of bunnyByChapter) {
    videos.sort(
      (a, b) =>
        new Date(a.dateUploaded).getTime() - new Date(b.dateUploaded).getTime()
    );
  }

  // 4. Match and recover
  let matched = 0;
  let unmatched = 0;

  console.log("─".repeat(80));
  console.log("MATCHING RESULTS:");
  console.log("─".repeat(80));

  // Group orphaned lessons by chapter for position-based matching
  const lessonsByChapter = new Map<string, typeof orphanedLessons>();
  for (const lesson of orphanedLessons) {
    const chId = lesson.chapterId.toString();
    if (!lessonsByChapter.has(chId)) lessonsByChapter.set(chId, []);
    lessonsByChapter.get(chId)!.push(lesson);
  }

  // Track used Bunny video GUIDs to prevent double-assigning
  const usedGuids = new Set<string>();

  for (const [chapterId, lessonsInChapter] of lessonsByChapter) {
    const chapter = chapterMap.get(chapterId);
    if (!chapter) continue;

    const courseName = courseMap.get(chapter.courseId.toString()) || "";
    const chapterTitle = chapter.title;

    console.log(`\n  📂 Chapter: "${chapterTitle}" (Course: "${courseName}")`);

    // Get the Bunny videos for this chapter
    const chapterKey = `${courseName.toLowerCase()}|${chapterTitle.toLowerCase()}`;
    const chapterVideos = bunnyByChapter.get(chapterKey) || [];

    for (let i = 0; i < lessonsInChapter.length; i++) {
      const lesson = lessonsInChapter[i];

      // Strategy 1: Exact title match
      const exactKey = `${courseName.toLowerCase()}|${chapterTitle.toLowerCase()}|${lesson.title.toLowerCase()}`;
      const exactMatches = (bunnyByKey.get(exactKey) || []).filter(
        (v) => !usedGuids.has(v.guid)
      );

      if (exactMatches.length > 0) {
        // Use the most recent one
        const best = exactMatches.sort(
          (a, b) =>
            new Date(b.dateUploaded).getTime() -
            new Date(a.dateUploaded).getTime()
        )[0];

        matched++;
        usedGuids.add(best.guid);
        console.log(
          `     ✅ "${lesson.title}" → ${best.guid} (exact title match)`
        );

        if (!DRY_RUN) {
          await Lesson.findByIdAndUpdate(lesson._id, {
            bunnyVideoId: best.guid,
            videoStatus: "ready",
          });
        }
        continue;
      }

      // Strategy 2: Position-based match (lesson order matches upload order)
      // Find unused videos in this chapter
      const availableChapterVideos = chapterVideos.filter(
        (v) => !usedGuids.has(v.guid)
      );

      if (availableChapterVideos.length > 0 && i < availableChapterVideos.length) {
        const positionalMatch = availableChapterVideos[i];
        const parsed = parseBunnyTitle(positionalMatch.title);

        matched++;
        usedGuids.add(positionalMatch.guid);
        console.log(
          `     ✅ "${lesson.title}" → ${positionalMatch.guid} (position match, Bunny title: "${parsed?.lessonTitle}")`
        );

        if (!DRY_RUN) {
          await Lesson.findByIdAndUpdate(lesson._id, {
            bunnyVideoId: positionalMatch.guid,
            videoStatus: "ready",
          });
        }
        continue;
      }

      // No match found
      unmatched++;
      console.log(`     ❌ "${lesson.title}" — no matching Bunny video found`);
    }
  }

  // 5. Summary
  console.log("\n" + "═".repeat(80));
  console.log("SUMMARY");
  console.log("═".repeat(80));
  console.log(`  ✅ Matched:   ${matched}`);
  console.log(`  ❌ Unmatched: ${unmatched}`);
  console.log(`  📝 Total:     ${orphanedLessons.length}`);
  console.log(
    `  📹 Unused Bunny videos: ${lessonVideos.length - usedGuids.size}`
  );

  if (DRY_RUN) {
    console.log(`\n💡 This was a DRY RUN. To apply changes, run:\n`);
    console.log(`   npx tsx scripts/recover-bunny-videos.ts --apply\n`);
  } else {
    console.log(`\n🎉 Recovery complete! ${matched} lessons restored.\n`);
  }

  await mongoose.disconnect();
}

recover().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
