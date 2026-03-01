import { readdir, stat, unlink } from "fs/promises";
import path from "path";

/**
 * Lazy cleanup script to remove abandoned files from the temp uploads directory.
 * Any file older than 24 hours will be deleted.
 */
export async function cleanupTempFiles() {
  try {
    const uploadDir = process.env.UPLOAD_DIR || "public/uploads";
    const tempDir = path.join(process.cwd(), uploadDir, "temp");

    let files;
    try {
      files = await readdir(tempDir);
    } catch (err) {
      // If the directory doesn't exist yet, there's nothing to clean up.
      return;
    }

    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    for (const file of files) {
      // Don't delete hidden files or directories like .gitkeep
      if (file.startsWith(".")) continue;

      const filePath = path.join(tempDir, file);

      try {
        const fileStats = await stat(filePath);

        // Check if the file is older than 24 hours
        if (now - fileStats.mtimeMs > TWENTY_FOUR_HOURS) {
          await unlink(filePath);
          console.log(`[Temp Cleanup] Deleted abandoned file: ${file}`);
        }
      } catch (fileErr) {
        console.error(`[Temp Cleanup] Failed to process ${file}:`, fileErr);
      }
    }
  } catch (error) {
    console.error("[Temp Cleanup] Overall failure:", error);
  }
}
