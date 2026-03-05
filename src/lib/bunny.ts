import crypto from "crypto";

const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY!;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID!;
const BUNNY_TOKEN_AUTH_KEY = process.env.BUNNY_TOKEN_AUTH_KEY!;

/**
 * Generate a signed Bunny.net embed URL for a video.
 * The URL expires after 4 hours — students can't share it beyond that.
 * This must only be called server-side (API routes / Server Components).
 */
export function generateSignedEmbedUrl(videoId: string): string {
  const expires = Math.floor(Date.now() / 1000) + 14400; // 4 hours

  const token = crypto
    .createHash("sha256")
    .update(BUNNY_TOKEN_AUTH_KEY + videoId + expires)
    .digest("hex");

  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?token=${token}&expires=${expires}`;
}

/**
 * Generate an unsigned (public) Bunny.net embed URL.
 * Used for public preview videos that don't need access control.
 */
export function generatePublicEmbedUrl(videoId: string): string {
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
}

/**
 * Create a new video object on Bunny Stream.
 * Returns the video GUID and tus upload credentials for client-side upload.
 */
export async function createBunnyVideo(title: string) {
  // Step 1: Create video object on Bunny
  const createRes = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: BUNNY_STREAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    },
  );

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create Bunny video: ${errorText}`);
  }

  const { guid: videoId } = await createRes.json();

  // Step 2: Generate tus upload signature (1 hour expiry)
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const signature = crypto
    .createHash("sha256")
    .update(BUNNY_LIBRARY_ID + BUNNY_STREAM_API_KEY + expiresAt + videoId)
    .digest("hex");

  return {
    videoId,
    libraryId: BUNNY_LIBRARY_ID,
    expiresAt,
    signature,
  };
}

/**
 * Delete a video from Bunny Stream.
 * Useful when a coach replaces a lesson video or a course is deleted.
 */
export async function deleteBunnyVideo(videoId: string) {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    {
      method: "DELETE",
      headers: {
        AccessKey: BUNNY_STREAM_API_KEY,
      },
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete Bunny video: ${errorText}`);
  }

  return true;
}

/**
 * Fetches the current processing status of a video from Bunny Stream.
 * Returns the status code: 0 = Created, 1 = Uploaded, 2 = Processing, 3 = Finished, 4 = Error
 */
export async function getBunnyVideoStatus(videoId: string): Promise<number> {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    {
      headers: {
        AccessKey: BUNNY_STREAM_API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 0 }, // Don't cache this request
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch Bunny video status: ${errorText}`);
  }

  const data = await res.json();
  return data.status;
}
