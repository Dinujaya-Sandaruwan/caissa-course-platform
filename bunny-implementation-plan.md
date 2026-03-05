# 🐰 Bunny.net Migration — Step-by-Step Implementation Plan

> **Goal:** Replace Google Drive video embedding with Bunny.net Stream across the entire Caissa Course Platform. Each step is small and trackable. Steps marked **👤 YOU** require your action. Steps marked **🤖 AI** will be done by the AI assistant.

---

## Prerequisites

Before we begin, make sure you have:

- A Bunny.net account (free 14-day trial at [bunny.net](https://bunny.net))
- Access to your Vercel/production environment settings (for later)

---

## Phase 1 — Bunny.net Account & Video Library Setup

### Step 1.1 — Create Bunny.net Account 👤 YOU

1. Go to [bunny.net](https://bunny.net) and sign up (14-day free trial)
2. Verify your email and log in to the dashboard

### Step 1.2 — Create a Video Library 👤 YOU

1. In the Bunny dashboard, go to **Stream** → **Add Video Library**
2. Name it: `Caissa Courses`
3. Choose storage region: **Singapore** (closest to Sri Lanka)
4. After creation, note down the **Library ID** (it's a number, visible in the library URL or settings page)

### Step 1.3 — Get API Keys 👤 YOU

1. Go to your Video Library → **API** section (in the left sidebar)
2. Copy the **Stream API Key** — this is used for uploading and managing videos
3. Go to **Security** settings in the library
4. Enable **"Token Authentication"** for embed URLs
5. Copy the **Token Authentication Key** — this is used for generating signed embed URLs
6. Note down the **CDN Hostname** — it looks like `vz-xxxxxxxx-xxx.b-cdn.net` (visible in library settings)

### Step 1.4 — Provide Environment Variables to AI 👤 YOU

Once you have all the keys, provide them to me in this format (I'll add them to your `.env` file):

```
BUNNY_STREAM_API_KEY=your-stream-api-key
BUNNY_LIBRARY_ID=your-library-id-number
BUNNY_TOKEN_AUTH_KEY=your-token-authentication-key
BUNNY_CDN_HOSTNAME=vz-xxxxxxxx-xxx.b-cdn.net
```

> ⚠️ These keys must NEVER be prefixed with `NEXT_PUBLIC_`. They are server-side only.

---

## Phase 2 — Environment Variables

### Step 2.1 — Add Bunny.net env vars to `.env` 🤖 AI

Add the 4 Bunny environment variables to the `.env` file (using the values you provided in Step 1.4).

**File:** `.env`

---

## Phase 3 — Install Dependencies

### Step 3.1 — Install `tus-js-client` 🤖 AI

Install the tus resumable upload library for reliable video uploads:

```bash
npm install tus-js-client
```

**Why:** Bunny Stream uses the tus protocol for uploads. This allows resumable uploads — if a coach's upload drops mid-way, it picks up where it left off instead of restarting.

---

## Phase 4 — Database Model Changes

### Step 4.1 — Update `Lesson` model 🤖 AI

**File:** `src/models/Lesson.ts`

- Add new field: `bunnyVideoId` (String, optional) — stores the Bunny video GUID
- Update `videoStatus` enum: change from `["pending", "uploaded", "ready"]` to `["pending", "uploaded", "processing", "ready"]`
- Keep `videoUrl` and `tempVideoPath` for now (backward compatibility during transition)

### Step 4.2 — Update `Course` model 🤖 AI

**File:** `src/models/Course.ts`

- Add new field: `bunnyPreviewVideoId` (String, optional) — stores the Bunny video GUID for the public course preview
- Keep `previewVideoUrl` and `tempPreviewVideoPath` for now

---

## Phase 5 — Server-Side Utilities

### Step 5.1 — Create Bunny utility library 🤖 AI

**File (NEW):** `src/lib/bunny.ts`

Create a utility file with two functions:

1. `generateBunnyEmbedUrl(videoId)` — generates a time-limited signed embed URL using SHA-256 (4-hour expiry)
2. `createBunnyVideo(title)` — creates a video object on Bunny and returns the video GUID + tus upload credentials

---

## Phase 6 — Upload API Routes

### Step 6.1 — Create video upload API route 🤖 AI

**File (NEW):** `src/app/api/bunny/create-video/route.ts`

POST endpoint that:

1. Receives `{ title }` from the client
2. Creates a video object on Bunny Stream API
3. Returns `{ videoId, libraryId, expiresAt, signature }` — the tus upload credentials for client-side upload

Only authenticated coaches/managers can call this.

### Step 6.2 — Create webhook handler for encoding completion 🤖 AI

**File (NEW):** `src/app/api/bunny/webhook/route.ts`

POST endpoint that Bunny calls when a video finishes encoding:

1. Receives the webhook payload from Bunny
2. Finds the lesson or course with matching `bunnyVideoId`/`bunnyPreviewVideoId`
3. Sets `videoStatus = "ready"`

> ⚠️ **Note:** Webhooks only work on a publicly accessible URL. During local development, you can skip the webhook and manually set status to "ready" after upload. In production, this will work automatically.

---

## Phase 7 — Video Uploader Component

### Step 7.1 — Create VideoUploader component 🤖 AI

**File (NEW):** `src/components/VideoUploader.tsx`

A reusable client component that:

1. Shows a file picker for video files
2. Calls our `/api/bunny/create-video` to get tus credentials
3. Uploads the file directly to Bunny using the tus protocol (with progress bar)
4. Returns the `videoId` to the parent component on success
5. Shows upload progress, success, and error states

---

## Phase 8 — Coach Pages (Video Upload Integration)

### Step 8.1 — Update Coach "New Course" page 🤖 AI

**File:** `src/app/(coach)/coach/courses/new/page.tsx`

- Replace the local file upload for lesson videos with the `VideoUploader` component
- When a video is uploaded, store the `bunnyVideoId` instead of `tempVideoPath`
- Replace the preview video local upload with `VideoUploader` as well
- Set `videoStatus = "processing"` after upload starts

### Step 8.2 — Update Coach "Edit Course" page 🤖 AI

**File:** `src/app/(coach)/coach/courses/[id]/edit/page.tsx`

- Same changes as Step 8.1 but for the edit page
- Show existing Bunny video status if a `bunnyVideoId` already exists
- Allow re-upload (replaces the old video)

### Step 8.3 — Update Coach lesson API routes 🤖 AI

**Files:**

- `src/app/api/coach/courses/[id]/chapters/[chapterId]/lessons/route.ts` (create lesson)
- `src/app/api/coach/courses/[id]/chapters/[chapterId]/lessons/[lessonId]/route.ts` (update lesson)

- Accept `bunnyVideoId` field in the request body
- Set `videoStatus = "processing"` when a `bunnyVideoId` is provided
- Remove/skip the `tempVideoPath` handling for new uploads (keep for backward compat)

---

## Phase 9 — Manager Dashboard Changes

### Step 9.1 — Update Manager course detail page 🤖 AI

**File:** `src/app/(manager)/manager/courses/[id]/page.tsx`

- **Remove** the Google Drive URL text inputs for each lesson
- **Remove** the "Paste Google Drive URL" placeholder text and workflow
- **Replace with** a read-only video status display per lesson:
  - ✅ Ready (with Bunny video ID shown)
  - ⏳ Processing...
  - ❌ No video uploaded
- **Remove** the "Download temp file" links (no longer needed — coaches upload directly to Bunny)
- **Replace** the preview video URL input with `VideoUploader` component or read-only status
- Allow manager to preview videos using the signed Bunny embed URL

### Step 9.2 — Update/Remove Manager video-url API route 🤖 AI

**File:** `src/app/api/manager/courses/[id]/lessons/[lessonId]/video-url/route.ts`

- This route currently lets managers paste Google Drive URLs
- Repurpose or remove this route — managers no longer manually set URLs
- If keeping: change to accept `bunnyVideoId` instead of `videoUrl`

### Step 9.3 — Update Manager preview-url API route 🤖 AI

**File:** `src/app/api/manager/courses/[id]/preview-url/route.ts`

- Change to accept `bunnyPreviewVideoId` instead of `previewVideoUrl`
- Update the Course document accordingly

### Step 9.4 — Update Manager course data API route 🤖 AI

**File:** `src/app/api/manager/courses/[id]/route.ts`

- Include `bunnyVideoId` in the lesson select fields (currently selects `videoUrl tempVideoPath videoStatus`)

---

## Phase 10 — Student Learning Page

### Step 10.1 — Update Student content API route 🤖 AI

**File:** `src/app/api/student/courses/[id]/content/route.ts`

- Instead of returning raw `videoUrl`, generate a signed Bunny embed URL server-side using `generateBunnyEmbedUrl()`
- Return `videoEmbedUrl` field (signed, time-limited) instead of `videoUrl`
- Falls back to old `videoUrl` if `bunnyVideoId` is not set (backward compatibility)

### Step 10.2 — Update Student learn page 🤖 AI

**File:** `src/app/(student)/courses/[id]/learn/page.tsx`

- Update the `Lesson` interface: add `videoEmbedUrl` field
- Change the iframe `src` from `currentLesson.videoUrl` to `currentLesson.videoEmbedUrl`
- Update the `allow` attribute on the iframe to include: `accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture`

---

## Phase 11 — Public Course Preview Page

### Step 11.1 — Update public courses API 🤖 AI

**File:** `src/app/api/courses/[id]/route.ts`

- If course has `bunnyPreviewVideoId`, generate an **unsigned** Bunny embed URL (previews are public, no token needed)
- Return `previewVideoUrl` as the Bunny embed URL
- Falls back to old `previewVideoUrl` if `bunnyPreviewVideoId` is not set

### Step 11.2 — Update public course detail page 🤖 AI

**File:** `src/app/(public)/courses/[id]/page.tsx`

- The iframe already uses `course.previewVideoUrl` — no change needed if the API returns the correct URL
- Update iframe `allow` attributes for Bunny player compatibility

### Step 11.3 — Update public courses list API 🤖 AI

**File:** `src/app/api/courses/route.ts`

- Currently selects `previewVideoUrl` — update to also handle `bunnyPreviewVideoId` if needed for list views

---

## Phase 12 — Publish Route Update

### Step 12.1 — Update publish validation 🤖 AI

**File:** `src/app/api/manager/courses/[id]/publish/route.ts`

- Currently checks `course.previewVideoUrl` and lesson `videoStatus === "ready"`
- Add check for `bunnyPreviewVideoId` as an alternative to `previewVideoUrl`
- The `videoStatus` check already works (lessons still use "ready" status)

---

## Phase 13 — Clean Up Old Google Drive Code

### Step 13.1 — Remove Google Drive references 🤖 AI

After everything is working with Bunny:

- Remove `videoUrl` field from `Lesson` model
- Remove `previewVideoUrl` and `tempPreviewVideoPath` fields from `Course` model
- Remove `tempVideoPath` field from `Lesson` model
- Remove the local file upload API routes for lesson videos
- Remove the `video-url` API route (or confirm it's been repurposed)
- Clean up all "Google Drive" text references in the UI

> ⚠️ **This step should only happen after all existing courses have been migrated to Bunny.**

---

## Phase 14 — Bunny Dashboard Security (Production)

### Step 14.1 — Set allowed domains 👤 YOU

1. Go to Bunny dashboard → Video Library → **Security**
2. Under **Allowed Referrers**, add your production domain (e.g., `caissa.lk`)
3. This prevents your videos from being embedded on other websites

### Step 14.2 — Set up webhook URL (Production) 👤 YOU

1. Go to Bunny dashboard → Video Library → **Webhooks** (or Notifications)
2. Add your production webhook URL: `https://yourdomain.com/api/bunny/webhook`
3. This enables automatic `videoStatus` updates when encoding finishes

### Step 14.3 — Add env vars to Vercel/production 👤 YOU

1. Go to your Vercel dashboard → Project Settings → Environment Variables
2. Add the same 4 Bunny env vars:
   - `BUNNY_STREAM_API_KEY`
   - `BUNNY_LIBRARY_ID`
   - `BUNNY_TOKEN_AUTH_KEY`
   - `BUNNY_CDN_HOSTNAME`
3. Redeploy

---

## Phase 15 — Migration of Existing Videos

### Step 15.1 — Decide migration strategy 👤 YOU

Choose one:

- **Option A (Recommended):** Have coaches re-upload their existing videos via the new uploader. Simple, clean, no scripts needed.
- **Option B:** Write a migration script that downloads from Google Drive and re-uploads to Bunny. More complex, may hit Google auth issues.

### Step 15.2 — Execute migration 👤 YOU / 🤖 AI

- If Option A: Notify coaches to re-upload videos. No code needed.
- If Option B: AI writes a migration script (only if requested).

### Step 15.3 — Remove old `videoUrl` data from database 👤 YOU / 🤖 AI

After all videos are on Bunny, clean up the database:

- Set `videoUrl = null` on all migrated lessons
- Set `previewVideoUrl = null` on all migrated courses
- This is optional but keeps the database clean

---

## Summary of Files Changed

| File                                                                              | Action                                                   | Phase |
| --------------------------------------------------------------------------------- | -------------------------------------------------------- | ----- |
| `.env`                                                                            | Modify — add 4 Bunny env vars                            | 2     |
| `src/models/Lesson.ts`                                                            | Modify — add `bunnyVideoId`, update `videoStatus` enum   | 4     |
| `src/models/Course.ts`                                                            | Modify — add `bunnyPreviewVideoId`                       | 4     |
| `src/lib/bunny.ts`                                                                | **NEW** — signed URL generation + video creation utility | 5     |
| `src/app/api/bunny/create-video/route.ts`                                         | **NEW** — upload credential endpoint                     | 6     |
| `src/app/api/bunny/webhook/route.ts`                                              | **NEW** — encoding completion webhook                    | 6     |
| `src/components/VideoUploader.tsx`                                                | **NEW** — tus-based video upload component               | 7     |
| `src/app/(coach)/coach/courses/new/page.tsx`                                      | Modify — use Bunny uploader                              | 8     |
| `src/app/(coach)/coach/courses/[id]/edit/page.tsx`                                | Modify — use Bunny uploader                              | 8     |
| `src/app/api/coach/courses/[id]/chapters/[chapterId]/lessons/route.ts`            | Modify — accept `bunnyVideoId`                           | 8     |
| `src/app/api/coach/courses/[id]/chapters/[chapterId]/lessons/[lessonId]/route.ts` | Modify — accept `bunnyVideoId`                           | 8     |
| `src/app/(manager)/manager/courses/[id]/page.tsx`                                 | Modify — remove Drive URL inputs, show status            | 9     |
| `src/app/api/manager/courses/[id]/lessons/[lessonId]/video-url/route.ts`          | Remove or repurpose                                      | 9     |
| `src/app/api/manager/courses/[id]/preview-url/route.ts`                           | Modify — accept `bunnyPreviewVideoId`                    | 9     |
| `src/app/api/manager/courses/[id]/route.ts`                                       | Modify — include `bunnyVideoId`                          | 9     |
| `src/app/api/student/courses/[id]/content/route.ts`                               | Modify — return signed embed URLs                        | 10    |
| `src/app/(student)/courses/[id]/learn/page.tsx`                                   | Modify — use `videoEmbedUrl`                             | 10    |
| `src/app/api/courses/[id]/route.ts`                                               | Modify — generate Bunny preview URL                      | 11    |
| `src/app/(public)/courses/[id]/page.tsx`                                          | Minor — update iframe attributes                         | 11    |
| `src/app/api/courses/route.ts`                                                    | Minor — handle `bunnyPreviewVideoId`                     | 11    |
| `src/app/api/manager/courses/[id]/publish/route.ts`                               | Modify — accept `bunnyPreviewVideoId`                    | 12    |

---

## How We'll Verify It Works

Since this is a full-stack integration with an external service (Bunny.net), testing will be done through manual end-to-end verification:

1. **Upload test:** Coach uploads a test video → verify it appears in Bunny dashboard → verify `bunnyVideoId` is stored in DB
2. **Playback test:** Student opens lesson → verify signed Bunny embed URL loads → video plays in the player
3. **Preview test:** Public course page → verify unsigned Bunny preview video plays
4. **Security test:** Copy a signed embed URL → wait 4+ hours → verify it expires and stops working
5. **Manager view test:** Manager can see video status (processing/ready) without needing to paste URLs

---

_Created: March 2025 | This plan replaces the Google Drive workflow entirely with Bunny.net Stream._
