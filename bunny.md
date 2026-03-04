# 🐰 Bunny.net Integration Plan — Caissa Course Platform

> **Goal:** Replace the current Google Drive iFrame video workflow with a professional, scalable, CDN-backed video pipeline using **Bunny.net Stream + Bunny CDN**. This document covers what Bunny.net is, why it is the right fit, complete pricing, and a step-by-step technical implementation plan for Next.js.

---

## Table of Contents

1. [What is Bunny.net?](#1-what-is-bunnynet)
2. [Why Move Away from Google Drive?](#2-why-move-away-from-google-drive)
3. [Bunny.net Services We Will Use](#3-bunnynet-services-we-will-use)
4. [Pricing Breakdown](#4-pricing-breakdown)
5. [How the New Video Flow Works](#5-how-the-new-video-flow-works)
6. [Architecture Overview](#6-architecture-overview)
7. [Step-by-Step Implementation Plan](#7-step-by-step-implementation-plan)
   - [Phase 1 — Bunny Dashboard Setup](#phase-1--bunny-dashboard-setup)
   - [Phase 2 — Environment Variables](#phase-2--environment-variables)
   - [Phase 3 — Upload API (Coaches Upload Videos)](#phase-3--upload-api-coaches-upload-videos)
   - [Phase 4 — Video Player (Students Watch Videos)](#phase-4--video-player-students-watch-videos)
   - [Phase 5 — Signed URLs for Access Control](#phase-5--signed-urls-for-access-control)
   - [Phase 6 — Database & Model Changes](#phase-6--database--model-changes)
   - [Phase 7 — Manager Dashboard Changes](#phase-7--manager-dashboard-changes)
   - [Phase 8 — Migration of Existing Videos](#phase-8--migration-of-existing-videos)
8. [Security Considerations](#8-security-considerations)
9. [File & Code Change Summary](#9-file--code-change-summary)
10. [Cost Estimation for Caissa](#10-cost-estimation-for-caissa)

---

## 1. What is Bunny.net?

**Bunny.net** is a global Content Delivery Network (CDN) and media delivery platform. It is NOT a storage solution like Google Drive — it is a purpose-built infrastructure for hosting, transcoding, and delivering video content at scale.

Bunny.net has three products we care about:

| Product           | What it does                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| **Bunny Stream**  | Upload videos → auto-transcode to multiple qualities (240p → 4K) → deliver via CDN → embed with a player |
| **Bunny CDN**     | Global edge network (119+ PoPs worldwide) that accelerates delivery of any file                          |
| **Bunny Storage** | Object storage (like S3) — used internally by Stream, can also be used for thumbnails etc.               |

For Caissa, we primarily need **Bunny Stream**. Bunny CDN is included automatically because Stream uses it under the hood to serve videos.

---

## 2. Why Move Away from Google Drive?

| Problem with Google Drive  | Impact on Caissa                                                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Rate limiting**          | When many students watch simultaneously, Google throttles the drive bandwidth — videos fail to load or buffer forever |
| **Quota exceeded errors**  | Google Drive has daily bandwidth limits per file; popular lessons can get blocked                                     |
| **No adaptive bitrate**    | Drive serves one quality — poor experience on slow connections                                                        |
| **No analytics**           | Zero visibility into who watched what, play rates, drop-off points                                                    |
| **Hotlinking/piracy risk** | Anyone can share the Drive link and the video is publicly accessible                                                  |
| **No professional player** | The Google Drive iFrame looks dated and has limited controls                                                          |
| **Not production-grade**   | Google Drive is a file storage product, not a video CDN                                                               |

**Bunny.net Stream solves every one of these problems.**

---

## 3. Bunny.net Services We Will Use

### 3.1 Bunny Stream (Core Service)

- Upload videos via API or dashboard
- **Automatic transcoding** to 240p, 360p, 480p, 720p, 1080p, 4K (based on source)
- **Adaptive bitrate (HLS)** — automatically switches quality based on viewer's connection
- **Free built-in video player** — modern, responsive, branded
- Embed via iframe: `https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}`
- **Webhook support** — get notified when encoding is complete
- Analytics dashboard — views, watch time, geography

### 3.2 Token Authentication (Security)

- Generates **signed embed URLs** with expiration timestamps
- Prevents unauthorized sharing of video links
- Token is a SHA-256 hash: `SHA256(tokenKey + videoId + expiresTimestamp)`
- This ensures only your enrolled students can watch lesson videos

### 3.3 Bunny CDN (Auto-included)

- 119+ global Points of Presence (PoPs)
- Videos are served from the edge node closest to the viewer
- Zero configuration required — it's built into Stream

### 3.4 Tus Resumable Upload Protocol (Optional Enhancement)

- Bunny Stream supports the **tus protocol** for resumable uploads
- Critical for coaches uploading large video files (100 MB+)
- If the upload drops mid-way, it **resumes from where it stopped**
- Bunny reported a **90% reduction in upload failures** after switching to tus

---

## 4. Pricing Breakdown

> All prices are based on **Bunny.net's official 2025 pay-as-you-go pricing**. No subscriptions, no seat fees — you only pay for what you use.

### 4.1 Bunny Stream Storage

| Tier                                           | Price                         |
| ---------------------------------------------- | ----------------------------- |
| **Edge Tier SSD** (fast, single region)        | $0.02 / GB / month            |
| **Edge Tier SSD** (each additional region)     | +$0.02 / GB / month           |
| **Standard Tier HDD** (up to 2 regions)        | $0.01 / GB / month per region |
| **Standard Tier HDD** (each additional region) | +$0.005 / GB / month          |

**Recommendation for Caissa:** Use **Standard Tier HDD with 1 region** at **$0.01/GB/month**. For 100 GB of videos = **$1/month** storage.

### 4.2 Bunny CDN Delivery (Bandwidth)

This is charged based on how much video data gets streamed to your students.

**Standard Network (119 PoPs, regional pricing):**

| Region                 | Price per GB |
| ---------------------- | ------------ |
| Europe & North America | $0.01 / GB   |
| Asia & Oceania         | $0.03 / GB   |
| South America          | $0.045 / GB  |
| Middle East & Africa   | $0.06 / GB   |

**Volume Network (10 PoPs, global flat rate — for high bandwidth):**

| Usage         | Price per GB |
| ------------- | ------------ |
| First 500 TB  | $0.005 / GB  |
| 500 TB – 1 PB | $0.004 / GB  |
| 1 PB – 2 PB   | $0.002 / GB  |

**Recommendation for Caissa:** Start with the **Standard Network**, Europe & North America tier at **$0.01/GB**. Your students are likely in South Asia so **$0.03/GB** is more realistic.

### 4.3 Transcoding

🎉 **FREE. No transcoding fees at all.** Bunny.net encodes to all quality levels at no cost. This alone makes it massively cheaper than Vimeo or Wistia.

### 4.4 Minimum Monthly Charge

**$1/month minimum** — even if you use almost nothing.

### 4.5 Summary Table

| Item                   | Cost        |
| ---------------------- | ----------- |
| Storage (per GB/month) | $0.01       |
| Bandwidth — Asia       | $0.03/GB    |
| Transcoding            | **FREE**    |
| Video Player           | **FREE**    |
| Security features      | **FREE**    |
| Monthly minimum        | **$1**      |
| Free trial             | **14 days** |

> **Example:** 100 GB stored + 1 TB bandwidth delivered to Asian students = ($1 storage) + ($30 delivery) = **~$31/month** for a medium-sized course platform. Compare this to Vimeo Pro ($200+/month) or Wistia ($300+/month).

---

## 5. How the New Video Flow Works

### Current Flow (Google Drive — Broken at Scale)

```
Coach uploads video file → Manager downloads → Uploads to Google Drive
→ Copies share link → Pastes into admin panel → Manager sets lesson videoUrl
→ Student watches via <iframe src="drive.google.com/..."> — FAIL at scale
```

### New Flow (Bunny Stream)

```
Coach uploads video (directly via our platform)
  → Goes to Next.js API route (server-side, key hidden)
  → API creates Bunny video object, gets videoId
  → File uploaded directly to Bunny via tus/PUT
  → Bunny transcodes automatically (webhook notifies us when done)
  → Database stores bunnyVideoId (NOT a URL)
  → When student opens lesson → server generates signed embed URL
  → Signed URL rendered in <iframe> with expiry
```

### Key Difference

We no longer store a **raw video URL** in the database. We store a **Bunny Video ID** (a GUID like `a1b2c3d4-...`). The actual playback URL is generated **on the fly** server-side with a time-limited signature. This means:

- Videos cannot be hotlinked
- Links expire (e.g., every 4 hours)
- Only authenticated enrolled students get valid links

---

## 6. Architecture Overview

```
┌──────────────────────────────────────┐
│           Caissa Platform            │
│                                      │
│  Coach Upload UI                     │
│      │                               │
│      ▼                               │
│  /api/bunny/upload-token  ◄──────────┼── Server generates tus auth headers
│      │                               │     (hides API key)
│      ▼                               │
│  tus client uploads directly         │
│  to Bunny edge ingest point          │
│                                      │
│  Bunny Webhook ──────────────────────┼──► /api/bunny/webhook
│  (encoding complete)                 │         │
│                                      │         ▼
│                                      │    Update lesson.bunnyVideoId
│                                      │    Set videoStatus = "ready"
│                                      │
│  Student visits /learn               │
│      │                               │
│      ▼                               │
│  /api/student/courses/[id]/content   │
│      │                               │
│      ▼                               │
│  Server generates signed embed URL   │
│  (SHA256 token, 4hr expiry)          │
│      │                               │
│      ▼                               │
│  <iframe src="signed-bunny-url" />   │
└──────────────────────────────────────┘
```

---

## 7. Step-by-Step Implementation Plan

### Phase 1 — Bunny Dashboard Setup

> Do this first before writing any code.

1. **Create a Bunny.net account** at [bunny.net](https://bunny.net) — start the 14-day free trial.

2. **Create a Video Library**:
   - Go to `Stream` → `Add Video Library`
   - Name it: `Caissa Courses`
   - Choose the closest storage region (e.g., Singapore for Sri Lanka)
   - Note down: **Library ID** (number)

3. **Get API Keys** from the library Settings → API:
   - `Stream API Key` — used for management (upload, delete, list)
   - `Token Authentication Key` — used for generating signed embed URLs
   - Enable **"Embed View Token Authentication"** in Security settings

4. **Configure Security Settings**:
   - Enable `Embed View Token Authentication`
   - (Optional) Enable `DRM Protection` via MediaCage Basic for extra security
   - Set allowed domains to your production domain (e.g., `caissa.lk`)

5. **Set up Webhook** (for encoding completion):
   - Library Settings → Notifications
   - Add webhook URL: `https://yourdomain.com/api/bunny/webhook`
   - Note the **Webhook API Key** for verifying incoming webhooks

---

### Phase 2 — Environment Variables

Add to your `.env.local` (and Vercel/production environment):

```env
# Bunny.net Stream
BUNNY_STREAM_API_KEY=your-stream-api-key-here
BUNNY_LIBRARY_ID=123456
BUNNY_TOKEN_AUTH_KEY=your-token-authentication-key-here
BUNNY_WEBHOOK_SECRET=your-webhook-secret-here

# CDN hostname (from library settings)
BUNNY_CDN_HOSTNAME=vz-xxxxxxxx-xxx.b-cdn.net
```

> ⚠️ **NEVER expose these in client-side code or `NEXT_PUBLIC_` variables.**

---

### Phase 3 — Upload API (Coaches Upload Videos)

#### 3.1 — Install Dependencies

```bash
npm install tus-js-client
```

#### 3.2 — Server Route: Generate Upload Token

**File: `src/app/api/bunny/create-video/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { title, lessonId } = await req.json();

  const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID!;
  const API_KEY = process.env.BUNNY_STREAM_API_KEY!;

  // Step 1: Create a video object on Bunny and get videoId
  const createRes = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    },
  );

  if (!createRes.ok) {
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 },
    );
  }

  const { guid: videoId } = await createRes.json();

  // Step 2: Generate tus presigned signature for client-side upload
  const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  const signature = crypto
    .createHash("sha256")
    .update(LIBRARY_ID + API_KEY + expiresAt + videoId)
    .digest("hex");

  return NextResponse.json({
    videoId,
    libraryId: LIBRARY_ID,
    expiresAt,
    signature,
  });
}
```

#### 3.3 — Client Component: Video Uploader for Coaches

**File: `src/components/coach/VideoUploader.tsx`**

```typescript
"use client";
import { useState, useRef } from "react";
import * as tus from "tus-js-client";

interface VideoUploaderProps {
  lessonId: string;
  title: string;
  onUploadComplete: (videoId: string) => void;
}

export default function VideoUploader({ lessonId, title, onUploadComplete }: VideoUploaderProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setStatus("uploading");

    // Get upload credentials from our server
    const res = await fetch("/api/bunny/create-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, lessonId }),
    });
    const { videoId, libraryId, expiresAt, signature } = await res.json();

    // Upload via tus (resumable)
    const upload = new tus.Upload(file, {
      endpoint: "https://video.bunnycdn.com/tusupload",
      retryDelays: [0, 3000, 5000, 10000],
      headers: {
        AuthorizationSignature: signature,
        AuthorizationExpire: String(expiresAt),
        VideoId: videoId,
        LibraryId: libraryId,
      },
      metadata: {
        filetype: file.type,
        title,
      },
      onProgress(bytesUploaded, bytesTotal) {
        setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess() {
        setStatus("done");
        onUploadComplete(videoId);
      },
      onError(error) {
        console.error("Upload failed:", error);
        setStatus("error");
      },
    });

    upload.start();
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="video/*" />
      <button onClick={handleUpload} disabled={status === "uploading"}>
        {status === "uploading" ? `Uploading ${progress}%` : "Upload Video"}
      </button>
      {status === "done" && <p>✅ Upload complete! Processing in Bunny...</p>}
      {status === "error" && <p>❌ Upload failed. Please try again.</p>}
    </div>
  );
}
```

#### 3.4 — Webhook Route: Handle Encoding Completion

**File: `src/app/api/bunny/webhook/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Lesson from "@/models/Lesson";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Verify it's a genuine Bunny webhook (check shared secret)
  const secret = req.headers.get("AccessKey");
  if (secret !== process.env.BUNNY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Bunny sends status 3 = encoding complete
  if (body.Status === 3) {
    const bunnyVideoId = body.VideoGuid;

    await dbConnect();
    await Lesson.findOneAndUpdate({ bunnyVideoId }, { videoStatus: "ready" });
  }

  return NextResponse.json({ ok: true });
}
```

---

### Phase 4 — Video Player (Students Watch Videos)

#### 4.1 — Generate Signed Embed URL (Server-Side)

Create a utility function:

**File: `src/lib/bunny.ts`**

```typescript
import crypto from "crypto";

export function generateBunnyEmbedUrl(videoId: string): string {
  const TOKEN_KEY = process.env.BUNNY_TOKEN_AUTH_KEY!;
  const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID!;

  const expires = Math.floor(Date.now() / 1000) + 14400; // 4 hours

  const token = crypto
    .createHash("sha256")
    .update(TOKEN_KEY + videoId + expires)
    .digest("hex");

  return `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?token=${token}&expires=${expires}`;
}
```

#### 4.2 — Update the Content API to Return Signed URLs

**File: `src/app/api/student/courses/[id]/content/route.ts`**

In the existing route, instead of returning raw `videoUrl`, generate a signed embed URL:

```typescript
import { generateBunnyEmbedUrl } from "@/lib/bunny";

// In your lesson mapping:
const lessonsWithUrls = lessons.map((lesson) => ({
  ...lesson.toObject(),
  // Replace raw videoUrl with a signed embed URL generated server-side
  videoEmbedUrl: lesson.bunnyVideoId
    ? generateBunnyEmbedUrl(lesson.bunnyVideoId)
    : null,
  videoUrl: undefined, // Remove raw URL from response
}));
```

#### 4.3 — Update the Student Learning Page

**File: `src/app/(student)/courses/[id]/learn/page.tsx`**

Change the existing iframe from:

```tsx
<iframe src={currentLesson.videoUrl} ... />
```

To:

```tsx
<iframe
  src={currentLesson.videoEmbedUrl}
  loading="lazy"
  style={{
    border: "none",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  }}
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
  allowFullScreen
/>
```

Wrap in a 16:9 responsive container:

```tsx
<div style={{ position: "relative", paddingTop: "56.25%" }}>
  {/* iframe above goes here */}
</div>
```

---

### Phase 5 — Signed URLs for Access Control

This is already covered in Phase 4. The key points:

- The `generateBunnyEmbedUrl()` function runs **server-side only** in an API route or Server Component
- It creates a token valid for **4 hours** — students can't share the embed URL beyond that
- The token is computed as: `SHA256(tokenAuthKey + videoId + expiresTimestamp)`
- **Bunny's servers verify this token before serving** — if it's invalid or expired → `403 Forbidden`
- For lessons (paid content): always use signed URLs
- For course preview videos (public): you can use unsigned URLs (no token needed)

---

### Phase 6 — Database & Model Changes

#### 6.1 — Update `Lesson` Model

**File: `src/models/Lesson.ts`**

Add the following fields. Keep `videoUrl` for backward compatibility during migration:

```typescript
// NEW FIELD — Bunny Video GUID
bunnyVideoId: {
  type: String,
  default: null,
},

// Optionally keep videoUrl for backwards compat
// but it will no longer be mandatory
```

Update `videoStatus` to include a `"processing"` state:

```typescript
videoStatus: {
  type: String,
  enum: ["none", "uploaded", "processing", "ready"],
  default: "none",
},
```

#### 6.2 — Update `Course` Model

**File: `src/models/Course.ts`**

Add:

```typescript
// Bunny Video ID for the public preview video
bunnyPreviewVideoId: {
  type: String,
  default: null,
},
```

Keep `previewVideoUrl` for backwards compatibility, but new previews will use `bunnyPreviewVideoId`.

---

### Phase 7 — Manager Dashboard Changes

#### 7.1 — Remove Manual URL Input

The current manager dashboard (`/manager/courses/[id]`) has text inputs for pasting Google Drive URLs. Once Bunny is integrated, **videos are uploaded directly by coaches** and auto-processed. The manager's role changes:

**Before:** Manager downloads coach file → uploads to Drive → pastes URL
**After:** Coach uploads directly → Manager sees "Processing" / "Ready" status → clicks Publish

#### 7.2 — Show Video Status Panel Instead of URL Input

Replace the current URL input fields with a **read-only status display**:

```tsx
// In manager/courses/[id]/page.tsx
{
  lesson.videoStatus === "ready" && (
    <span className="text-emerald-600">
      ✅ Ready — Bunny Video ID: {lesson.bunnyVideoId}
    </span>
  );
}
{
  lesson.videoStatus === "processing" && (
    <span className="text-amber-500">⏳ Encoding in progress...</span>
  );
}
{
  lesson.videoStatus === "none" && (
    <span className="text-gray-400">No video uploaded yet</span>
  );
}
```

#### 7.3 — Preview Iframe for Manager

The manager can still preview videos in the dashboard using the signed embed URL (generated server-side).

---

### Phase 8 — Migration of Existing Videos

For any courses already live with Google Drive URLs, we need a migration strategy:

#### Option A: Manual Re-upload (Recommended for Small Volume)

1. Coaches log in and re-upload their existing videos via the new uploader
2. Manager approves once all lessons have `videoStatus: "ready"` with `bunnyVideoId`
3. Old `videoUrl` field can be cleared

#### Option B: Scripted Migration (If Needed)

Write a migration script:

```typescript
// scripts/migrate-to-bunny.ts
// 1. Fetch all lessons with videoUrl but no bunnyVideoId
// 2. For each: create Bunny video object, download from Drive, upload to Bunny
// 3. Store returned GUID as bunnyVideoId
// 4. Set videoStatus = "ready" after upload
// 5. Clear tempVideoPath
```

> ⚠️ This should be done in a test environment first. Google Drive download may be blocked by auth.

#### Migration Field Strategy

```typescript
// Lesson model — transitional state
{
  videoUrl: "https://drive.google.com/...",  // OLD — phasing out
  bunnyVideoId: null,                         // NEW — being populated
  videoStatus: "ready"                        // shared field
}
```

Once a lesson has `bunnyVideoId`, the player uses the Bunny embed URL. Falls back to `videoUrl` if `bunnyVideoId` is null (backward compatibility during transition).

---

## 8. Security Considerations

| Threat                             | Protection                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| **API key exposure**               | Keys only in `.env`, used server-side in API routes — never `NEXT_PUBLIC_`                  |
| **Unauthorized video access**      | Signed embed URLs with 4-hour expiry; token uses SHA256                                     |
| **Non-enrolled students watching** | Content API authenticates student session before generating URL                             |
| **URL sharing**                    | Token expires — sharing a signed URL works for max 4 hours, then requires re-authentication |
| **Domain restriction**             | Set allowed embed domains in Bunny dashboard to `yourdomain.com` only                       |
| **Webhook forgery**                | Verify `AccessKey` header on webhook route against stored secret                            |
| **DRM (optional)**                 | Enable MediaCage Basic DRM in Bunny dashboard for extra protection against recording        |

---

## 9. File & Code Change Summary

| File                                                                     | Change Type      | Description                                               |
| ------------------------------------------------------------------------ | ---------------- | --------------------------------------------------------- |
| `src/models/Lesson.ts`                                                   | Modify           | Add `bunnyVideoId`, update `videoStatus` enum             |
| `src/models/Course.ts`                                                   | Modify           | Add `bunnyPreviewVideoId` field                           |
| `src/lib/bunny.ts`                                                       | **New**          | Utility: `generateBunnyEmbedUrl()`                        |
| `src/app/api/bunny/create-video/route.ts`                                | **New**          | POST: Create Bunny video object + tus credentials         |
| `src/app/api/bunny/webhook/route.ts`                                     | **New**          | POST: Handle encoding-complete webhook                    |
| `src/app/api/student/courses/[id]/content/route.ts`                      | Modify           | Return `videoEmbedUrl` (signed) instead of raw `videoUrl` |
| `src/app/api/manager/courses/[id]/lessons/[lessonId]/video-url/route.ts` | Modify or Remove | No longer needed for URL pasting                          |
| `src/app/api/manager/courses/[id]/preview-url/route.ts`                  | Modify           | Accept `bunnyPreviewVideoId` instead of raw URL           |
| `src/app/(student)/courses/[id]/learn/page.tsx`                          | Modify           | Use `videoEmbedUrl` field, update iframe                  |
| `src/app/(public)/courses/[id]/page.tsx`                                 | Modify           | Use Bunny embed for preview video                         |
| `src/app/(manager)/manager/courses/[id]/page.tsx`                        | Modify           | Remove Drive URL inputs, add status display               |
| `src/app/(coach)/coach/courses/[id]/edit/page.tsx`                       | Modify           | Add `VideoUploader` component for each lesson             |
| `src/components/coach/VideoUploader.tsx`                                 | **New**          | tus-based video uploader component                        |
| `.env.local`                                                             | Modify           | Add 5 new Bunny env variables                             |

---

## 10. Cost Estimation for Caissa

Let's estimate costs at different growth stages:

### Stage 1: Early — 50 active students, 20 courses, 100 GB video

| Item                         | Quantity | Unit Cost | Monthly       |
| ---------------------------- | -------- | --------- | ------------- |
| Storage                      | 100 GB   | $0.01/GB  | $1.00         |
| Bandwidth (avg 5 GB/student) | 250 GB   | $0.03/GB  | $7.50         |
| **Total**                    |          |           | **~$9/month** |

### Stage 2: Growth — 500 students, 50 courses, 400 GB video

| Item                          | Quantity | Unit Cost | Monthly         |
| ----------------------------- | -------- | --------- | --------------- |
| Storage                       | 400 GB   | $0.01/GB  | $4.00           |
| Bandwidth (avg 10 GB/student) | 5 TB     | $0.03/GB  | $150            |
| **Total**                     |          |           | **~$154/month** |

### Stage 3: Scale — 2,000 students, 2 TB video

| Item      | Quantity | Unit Cost | Monthly         |
| --------- | -------- | --------- | --------------- |
| Storage   | 2,000 GB | $0.01/GB  | $20             |
| Bandwidth | 20 TB    | $0.03/GB  | $600            |
| **Total** |          |           | **~$620/month** |

> **Compare:** Vimeo Pro ($200/month) caps at 5 TB storage and 20 TB bandwidth, with no adaptive quality. Wistia Pro starts at $300/month. **Bunny.net is a fraction of the cost and scales linearly.**

---

## 11. Recommended Implementation Order

1. ✅ Set up Bunny.net account & video library (15 minutes)
2. ✅ Add environment variables
3. ✅ Create `src/lib/bunny.ts` utility
4. ✅ Update Lesson and Course models
5. ✅ Build `/api/bunny/create-video` route
6. ✅ Build `/api/bunny/webhook` route
7. ✅ Build `VideoUploader` component
8. ✅ Integrate uploader into Coach course edit page
9. ✅ Update Content API to return signed embed URLs
10. ✅ Update Student learning page to use signed iframe
11. ✅ Update Manager dashboard (remove Drive URL fields, add status)
12. ✅ Update public Course preview page
13. ✅ Test full flow end-to-end in staging
14. ✅ Migrate existing videos (manual or scripted)
15. ✅ Set Bunny domain restrictions to production domain
16. ✅ Enable DRM (optional, after everything works)

---

## Quick Reference — Bunny.net API Endpoints

```
# Create video
POST https://video.bunnycdn.com/library/{libraryId}/videos
Header: AccessKey: {stream_api_key}
Body: { "title": "Lesson 1 - Introduction" }

# Upload via tus
Endpoint: https://video.bunnycdn.com/tusupload
Headers: AuthorizationSignature, AuthorizationExpire, VideoId, LibraryId

# Embed iframe URL (unsigned — for public previews)
https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}

# Embed iframe URL (signed — for enrolled students)
https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}?token={sha256_token}&expires={unix_ts}

# Get video details / status
GET https://video.bunnycdn.com/library/{libraryId}/videos/{videoId}
Header: AccessKey: {stream_api_key}

# Delete video
DELETE https://video.bunnycdn.com/library/{libraryId}/videos/{videoId}
Header: AccessKey: {stream_api_key}
```

---

_Last updated: March 2025 | Caissa Course Platform — Bunny.net Integration Planning Document_
