# Bunny.net Video Streaming Cost Optimization Report

After analyzing your current video streaming setup in `src/lib/bunny.ts` and `src/components/VideoUploader.tsx`, here is a comprehensive list of strategies to drastically reduce your Bunny.net streaming costs.

## 1. Transcoding & Resolution Optimization (Highest Impact)

Currently, Bunny Stream automatically transcodes uploaded videos into multiple resolutions (usually 240p, 360p, 480p, 720p, 1080p, and sometimes 4K) if left on default settings. You pay for storage for **every single resolution** generated.

**Actionable Steps in Bunny Dashboard:**

- **Disable 4K and 1440p:** Educational content (chess) rarely needs higher than 1080p. Often 720p is perfectly sufficient for screencasts.
- **Disable 240p/360p:** These look terrible on modern devices. Setting the minimum to 480p saves storage.
- **Enable "Original Quality" retention carefully:** If your coaches upload massive ProRes or uncompressed 5GB files, keeping the "Original" file costs a lot of storage. Check Bunny settings to delete the original after transcoding is complete.

## 2. Implement Bitrate Caps

Bunny Stream allows you to configure the Maximum Bitrate for your encoded files. Chess courses are mostly static screens with small piece movements—they do not need high bitrates.

**Actionable Steps:**

- Lower the video bitrate in your Bunny Stream Video Library settings. A 720p chess video can look crystal clear at **1000 kbps**. Default settings might be pushing 2500 - 4000 kbps, which triples your storage AND bandwidth costs. You MUST set this in the Bunny.net web dashboard, as there is no API method to change the library's encoding bitrate limit.

## 3. Storage Tier Optimization (Bunny Storage Zones)

When you create a Video Library in Bunny, the underlying storage dictates a large portion of the cost.

**Actionable Steps:**

- Make sure your underlying Edge Storage Zone is set to **Standard Tier**, NOT Premium Tier. Premium tier replicates the storage heavily across multiple continents. For a VOD (Video on Demand) platform, Standard storage is usually sufficient as the CDN layer handles the distribution.

## 4. Bandwidth Routing (Volume vs Standard Network)

Bunny offers two routing networks for CDN delivery.

**Actionable Steps:**

- Ensure your Pull Zone (attached to the Video Library) is configured to use the **Volume Network** if the bulk of your traffic is not hyper-latency sensitive. The Volume Network is drastically cheaper per GB than the Standard Tier, while still perfectly fast enough for streaming pre-recorded courses.

## 5. Implement Content Pre-Optimization (Code Level)

Currently, your `VideoUploader.tsx` accepts any file type (`accept="video/*"`) directly from the coach's device and uploads it raw via `tus`.

**Actionable Steps in Code:**

- **Pre-compression:** Implement a client-side FFmpeg library (like `@ffmpeg/ffmpeg` via WebAssembly) to compress the video _before_ it gets uploaded to Bunny. If a coach tries to upload a 2GB raw file, you can crush it down to 100MB right in their browser before `tus` sends it.
- **Strict File validation:** Limit file uploads to standard MP4s. Refuse `.mov` or `.mkv` files as they are often uncompressed and massive, forcing Bunny to do heavy lifting on the backend.

## 6. Token Authentication Tuning

You are already using Token Authentication (which is great!) in `src/lib/bunny.ts`:

```typescript
const expires = Math.floor(Date.now() / 1000) + 14400; // 4 hours
```

**Actionable Steps in Code:**

- Your token expires in 4 hours. You can reduce this to **2 hours** or match the average length of a user session. This guarantees that links are strictly not shareable or harvestable by bots, preventing unauthorized bandwidth leakage.

## Summary Checklist

1. [ ] **Dashboard:** Turn off unused high resolutions (4k, 1440p) and low resolutions (240p).
2. [ ] **Dashboard:** Lower the encoding bitrate specifically for screen-recorded content.
3. [ ] **Dashboard:** Switch to the Volume Tier network if currently on Premium/Standard.
4. [ ] **Project:** Consider adding client-side compression to prevent raw/massive payloads.
5. [ ] **Project:** Reduce the Token Auth expiry from 4 hours down to 1-2 hours.
