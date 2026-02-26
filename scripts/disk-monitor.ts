/**
 * Disk Usage Monitor Script
 *
 * Checks the disk usage of the uploads directory and sends a
 * WhatsApp alert to the manager if usage exceeds 70%.
 *
 * Usage:
 *   npx tsx scripts/disk-monitor.ts
 *
 * Cron job setup (every hour):
 *   0 * * * * cd /path/to/caissa-course-platform && npx tsx scripts/disk-monitor.ts >> /var/log/disk-monitor.log 2>&1
 */

import { execSync } from "child_process";
import path from "path";

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: path.resolve(process.cwd(), ".env.local") });

const UPLOADS_DIR = path.resolve(
  process.cwd(),
  process.env.UPLOAD_DIR || "public/uploads",
);
const MANAGER_NUMBER = process.env.MANAGER_WHATSAPP_NUMBER || "";
const THRESHOLD = 70; // percent

function getTimestamp(): string {
  return new Date().toISOString();
}

function getDiskUsagePercent(directory: string): number {
  try {
    // `df` returns disk usage for the partition containing the directory
    const output = execSync(`df -P "${directory}" | tail -1`, {
      encoding: "utf-8",
    });
    // Output format: Filesystem Blocks Used Available Capacity Mounted
    const parts = output.trim().split(/\s+/);
    const capacityStr = parts[4]; // e.g., "42%"
    const percent = parseInt(capacityStr.replace("%", ""), 10);
    return isNaN(percent) ? -1 : percent;
  } catch (error) {
    console.error(`[${getTimestamp()}] Error checking disk usage:`, error);
    return -1;
  }
}

async function main() {
  console.log(`[${getTimestamp()}] Checking disk usage for: ${UPLOADS_DIR}`);

  const usagePercent = getDiskUsagePercent(UPLOADS_DIR);

  if (usagePercent < 0) {
    console.error(`[${getTimestamp()}] Failed to determine disk usage.`);
    process.exit(1);
  }

  console.log(`[${getTimestamp()}] Disk usage: ${usagePercent}%`);

  if (usagePercent >= THRESHOLD) {
    console.log(
      `[${getTimestamp()}] ⚠️  Usage (${usagePercent}%) exceeds threshold (${THRESHOLD}%). Sending alert...`,
    );

    if (!MANAGER_NUMBER) {
      console.error(
        `[${getTimestamp()}] MANAGER_WHATSAPP_NUMBER is not set. Cannot send alert.`,
      );
      process.exit(1);
    }

    // Dynamic import to handle ESM/CJS compatibility
    const { notifyDiskUsageHigh } = await import("../src/lib/whatsapp");
    await notifyDiskUsageHigh(MANAGER_NUMBER, usagePercent);

    console.log(`[${getTimestamp()}] ✅ Alert sent to ${MANAGER_NUMBER}`);
  } else {
    console.log(
      `[${getTimestamp()}] ✅ Usage (${usagePercent}%) is below threshold (${THRESHOLD}%). No action needed.`,
    );
  }
}

main().catch((error) => {
  console.error(`[${getTimestamp()}] Fatal error:`, error);
  process.exit(1);
});
