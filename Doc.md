# Chess Course Platform — AI Agent Implementation Plan

## How to Use This Document

Each step in this plan is a single, atomic task. Give one step at a time to the AI agent. Review the output before proceeding to the next step. Steps are intentionally small so that mistakes are caught early and do not cascade into later work. Never skip a step. If a step produces an unexpected result, fix it before continuing.

When giving a step to the AI agent, include the full context of the step description below. The agent should complete exactly what is described — nothing more, nothing less.

---

## Part 1 — Project Scaffold

### Step 1 — Initialize the Next.js Project

Create a new Next.js project using the App Router. Use TypeScript. Include Tailwind CSS during setup. Name the project `chess-course-platform`. Do not add any other dependencies yet. Confirm the project runs on localhost with the default starter page.

---

### Step 2 — Clean the Default Starter Files

Remove all default boilerplate content from the Next.js starter. This includes clearing the default page content, removing the default global CSS rules that are not Tailwind-related, and deleting any example component files or assets that came with the template. Leave the project in a clean, empty state with a blank root page that renders without errors.

---

### Step 3 — Set Up the Folder Structure

Create the following empty folders inside the project. Do not add any files inside them yet, just establish the structure:

- `app/api` — for all backend API routes
- `app/(public)` — for pages accessible without login
- `app/(student)` — for student-facing pages
- `app/(coach)` — for coach-facing pages
- `app/(manager)` — for manager-facing pages
- `components/ui` — for small reusable UI elements
- `components/layout` — for layout wrappers and navigation
- `components/landing` — for landing page specific components
- `lib` — for utility functions and helper modules
- `models` — for database models
- `public/images` — for static image assets

---

### Step 4 — Install Core Dependencies

Install the following npm packages. Do not configure them yet, just install:

- `mongoose` — MongoDB ODM
- `jose` — for JWT session management
- `formidable` — for handling file uploads
- `bcryptjs` — for hashing OTP codes
- `file-type` — for server-side MIME type verification
- `clsx` — for conditional class name management in components
- `lucide-react` — for icons throughout the UI

---

### Step 5 — Create the Environment Variable File

Create a `.env.local` file at the root of the project. Add placeholder keys for the following variables. Use empty strings or placeholder text as values for now — do not add real credentials yet:

- `MONGODB_URI` — the MongoDB connection string
- `JWT_SECRET` — the secret key for signing JWT tokens
- `WHAPI_TOKEN` — the Whapi Cloud API token
- `WHAPI_BASE_URL` — the Whapi Cloud base URL
- `UPLOAD_DIR` — the server path where uploaded files will be stored

Add `.env.local` to `.gitignore` immediately.

---

### Step 6 — Create the Global Font and Base Styles

Configure the global font for the application. Use the Google Font `Inter` as the primary font via Next.js font optimization. Apply it to the root layout. Set a base background color and default text color in the global CSS that will serve as the foundation for the entire site's look. Keep it neutral at this stage.

---

## Part 2 — Landing Page

> The goal of these steps is to produce a complete, convincing landing page that can be shown to the client for approval. Focus entirely on visual quality and messaging. No backend logic is connected in this section.

---

### Step 7 — Create the Landing Page Route

Inside `app/(public)`, create the landing page file. This will be the root page of the site (`/`). For now it should render a single placeholder paragraph that says "Landing page coming soon." Confirm it loads correctly in the browser.

---

### Step 8 — Build the Navigation Bar Component

Create a `Navbar` component inside `components/landing`. This is the top navigation bar for the landing page. It should contain:

- A logo area on the left — use a simple text-based logo that reads "ChessMaster" (or a placeholder name) in a bold, styled font
- Navigation links in the center or right: "Courses", "Coaches", "About"
- Two buttons on the right: "Log In" and "Get Started" — these are not functional yet, they are visual only
- The navbar should be sticky so it stays at the top when scrolling
- It should be fully responsive and collapse into a hamburger menu on mobile

Import and render this Navbar at the top of the landing page.

---

### Step 9 — Build the Hero Section Component

Create a `HeroSection` component inside `components/landing`. This is the first large visual section below the navbar. It should contain:

- A large, bold headline such as "Master Chess from the World's Best Coaches"
- A supporting subtitle that briefly describes the platform — one or two sentences about learning chess through structured video courses
- Two call-to-action buttons: "Browse Courses" (primary, filled) and "Become a Coach" (secondary, outlined)
- A background that feels chess-themed — this can be a dark background with a subtle chessboard pattern using CSS, or a strong gradient. No external images needed.
- The layout should be centered and visually prominent

Import and render this HeroSection below the Navbar on the landing page.

---

### Step 10 — Build the Stats Bar Component

Create a `StatsBar` component inside `components/landing`. This is a narrow horizontal section that displays platform statistics to build credibility. It should show four statistics in a row:

- "50+ Courses"
- "20+ Expert Coaches"
- "1,000+ Students"
- "All Skill Levels"

These numbers are placeholder marketing figures for the landing page. Display them in a clean row with icons from lucide-react next to each. Use a contrasting background color to make this section visually distinct from the hero.

Import and render this below the HeroSection.

---

### Step 11 — Build the Featured Courses Section Component

Create a `FeaturedCourses` component inside `components/landing`. This section showcases sample course cards to demonstrate what the platform offers. Use entirely hardcoded placeholder data — no API calls. Create an array of four sample course objects inside the component file, each with:

- A course title (e.g., "Opening Principles for Beginners")
- A coach name (e.g., "GM Arjun Sharma")
- A difficulty level label ("Beginner", "Intermediate", or "Advanced")
- A price (e.g., "$29")
- A student count (e.g., "142 students")
- A placeholder thumbnail — use a colored div with a chess-related emoji or icon as a stand-in

Display these as a responsive grid of cards. Each card should have a clean design with a hover effect. Include a "View Course" button on each card that is visual only. Add a section heading above the grid: "Featured Courses".

Import and render this below the StatsBar.

---

### Step 12 — Build the How It Works Section Component

Create a `HowItWorks` component inside `components/landing`. This section explains the enrollment process to potential students in simple steps. Display four steps in a horizontal or vertical flow:

- Step 1: "Create Your Account" — sign up with your WhatsApp number in seconds
- Step 2: "Browse & Preview" — explore courses and watch free preview videos
- Step 3: "Enroll & Pay" — transfer the course fee and upload your receipt
- Step 4: "Start Learning" — get instant access once your payment is confirmed

Each step should have a number indicator, a short title, and one sentence of description. Use icons from lucide-react for visual interest. The section should feel light and easy to read.

Import and render this below the FeaturedCourses section.

---

### Step 13 — Build the Coaches Section Component

Create a `CoachesSection` component inside `components/landing`. This section showcases the coaching team to build trust. Use hardcoded placeholder data for three coaches, each with:

- A name (e.g., "GM Arjun Sharma")
- A specialty (e.g., "Opening Theory & Middlegame")
- A course count (e.g., "4 courses")
- A student count (e.g., "380 students")
- A placeholder avatar — use a styled div with the coach's initials

Display these as cards in a row. Add a section heading: "Learn from the Best". Include a "Join as a Coach" call-to-action button below the cards.

Import and render this below the HowItWorks section.

---

### Step 14 — Build the Testimonials Section Component

Create a `Testimonials` component inside `components/landing`. Display three student testimonials using hardcoded placeholder text. Each testimonial should include:

- A quote from the student about their experience
- The student's name and a label like "Chess Enthusiast" or "Club Player"
- A star rating display (five stars)
- A placeholder avatar using a styled div with initials

Use a card layout or a clean quote-block design. Add a section heading: "What Our Students Say".

Import and render this below the CoachesSection.

---

### Step 15 — Build the Call-to-Action Banner Component

Create a `CTABanner` component inside `components/landing`. This is a full-width section near the bottom of the page with a strong call to action. It should have:

- A bold headline: "Ready to Take Your Game to the Next Level?"
- A supporting line of text encouraging the visitor to sign up
- Two buttons: "Start Learning Today" and "Teach on Our Platform"
- A visually strong background — dark or accent-colored to contrast with the rest of the page

Import and render this below the Testimonials section.

---

### Step 16 — Build the Footer Component

Create a `Footer` component inside `components/landing`. The footer should include:

- The platform logo/name on the left
- Three columns of links: "Platform" (Courses, Coaches, About), "For Coaches" (Become a Coach, How It Works), "Support" (Contact, FAQ)
- These links are visual only and do not need to navigate anywhere yet
- A bottom bar with copyright text and a note that the platform is "Proudly built for the chess community"

Import and render this at the bottom of the landing page.

---

### Step 17 — Assemble and Polish the Landing Page

Open the landing page file and ensure all components are imported and rendered in the correct order from top to bottom:

1. Navbar
2. HeroSection
3. StatsBar
4. FeaturedCourses
5. HowItWorks
6. CoachesSection
7. Testimonials
8. CTABanner
9. Footer

Review the full page visually. Fix any spacing inconsistencies between sections. Ensure the page looks good on both desktop and mobile screen sizes. Ensure there are no console errors. This is the version to show the client.

---

### Step 18 — Add Page Metadata

In the landing page or root layout, add proper Next.js metadata for the page:

- Title: "ChessMaster — Learn Chess from Expert Coaches"
- Description: a one or two sentence summary of the platform
- Set the favicon to a simple chess piece emoji or Unicode character as a placeholder

---

## Part 3 — Infrastructure and Configuration

> These steps are done after the client approves the landing page. They set up the foundation for all backend functionality.

---

### Step 19 — Create the MongoDB Connection Utility

Inside `lib`, create a file called `db.ts`. This file should export a single async function that establishes a connection to MongoDB using Mongoose and the `MONGODB_URI` environment variable. It should use a cached connection pattern so the connection is not re-created on every request in a development environment. Do not connect to a real database yet — write the utility so it is ready to connect when the environment variable is filled in.

---

### Step 20 — Create the JWT Utility

Inside `lib`, create a file called `jwt.ts`. This file should export two functions:

- `signToken(payload)` — takes an object and returns a signed JWT string using the `jose` library and the `JWT_SECRET` environment variable. Set a 7-day expiry.
- `verifyToken(token)` — takes a JWT string and returns the decoded payload, or throws an error if the token is invalid or expired.

---

### Step 21 — Create the Cookie Utility

Inside `lib`, create a file called `cookies.ts`. This file should export two functions:

- `setSessionCookie(response, token)` — attaches the JWT as an HTTP-only, Secure, SameSite=Strict cookie named `session` to an outgoing response
- `clearSessionCookie(response)` — clears the session cookie by setting it with an expired date

---

### Step 22 — Create the WhatsApp Utility

Inside `lib`, create a file called `whatsapp.ts`. This file should export a single function called `sendWhatsAppMessage(phoneNumber, message)` that sends a POST request to the Whapi Cloud API using the `WHAPI_TOKEN` and `WHAPI_BASE_URL` environment variables. The function should accept a phone number and a plain text message string. Add basic error handling so that if the API call fails, an error is logged but not thrown — notification failures should never crash the main application flow.

---

### Step 23 — Create the Route Auth Helper

Inside `lib`, create a file called `auth.ts`. This file should export a function called `getSessionUser(request)` that:

- Reads the `session` cookie from an incoming Next.js request
- Verifies the JWT using the `verifyToken` function from the JWT utility
- Returns the decoded user object containing `userId`, `role`, and `whatsappNumber`
- Returns `null` if no valid session is found

This function will be called at the top of every protected API route.

---

### Step 24 — Create the Next.js Middleware for Route Protection

Create a `middleware.ts` file at the root of the project. This middleware should run on all requests and enforce the following rules:

- Any request to a path starting with `/manager` or `/api/manager` must have a valid session with role `manager`. If not, redirect to `/login`.
- Any request to a path starting with `/coach` or `/api/coach` must have a valid session with role `coach`. If not, redirect to `/login`.
- Any request to a path starting with `/student` or `/api/student` must have a valid session with role `student`. If not, redirect to `/login`.
- All other paths are public and pass through without any check.

---

## Part 4 — Database Models

> Create all Mongoose models before building any API routes. Define the schema, required fields, default values, and indexes for each model.

---

### Step 25 — Create the User Model

Inside `models`, create `User.ts`. Define a Mongoose schema with the following fields:

- `whatsappNumber` — String, required, unique
- `name` — String, required
- `email` — String, optional
- `role` — String, enum of `student`, `coach`, `manager`, required
- `status` — String, enum of `active`, `suspended`, default `active`
- `profilePhoto` — String, optional
- `createdAt` and `updatedAt` — handled by Mongoose timestamps option

Enable the `timestamps` option. Export the model.

---

### Step 26 — Create the OTPSession Model

Inside `models`, create `OTPSession.ts`. Define a Mongoose schema with:

- `whatsappNumber` — String, required
- `otpHash` — String, required (this stores the hashed OTP, never plaintext)
- `expiresAt` — Date, required
- `attempts` — Number, default 0
- `createdAt` — Date, default now

Create a TTL index on the `expiresAt` field with `expireAfterSeconds: 0` — this tells MongoDB to automatically delete documents when their `expiresAt` time passes. Export the model.

---

### Step 27 — Create the CoachProfile Model

Inside `models`, create `CoachProfile.ts`. Define a Mongoose schema with:

- `userId` — ObjectId, ref to User, required, unique
- `bio` — String, optional
- `specializations` — array of Strings, default empty array
- `verificationStatus` — String, enum of `pending`, `approved`, `rejected`, default `pending`
- `verificationNotes` — String, optional
- `verifiedBy` — ObjectId, ref to User, optional
- `verifiedAt` — Date, optional
- `createdAt` and `updatedAt` — via timestamps

Export the model.

---

### Step 28 — Create the Course Model

Inside `models`, create `Course.ts`. Define a Mongoose schema with:

- `coach` — ObjectId, ref to User, required
- `title` — String, required
- `description` — String, required
- `price` — Number, required
- `thumbnailUrl` — String, optional
- `previewVideoUrl` — String, optional
- `level` — String, enum of `beginner`, `intermediate`, `advanced`, required
- `tags` — array of Strings, default empty array
- `status` — String, enum of `draft`, `pending_review`, `approved`, `rejected`, `published`, `unpublished`, default `draft`
- `reviewNotes` — String, optional
- `reviewedBy` — ObjectId, ref to User, optional
- `reviewedAt` — Date, optional
- `enrollmentCount` — Number, default 0
- `createdAt` and `updatedAt` — via timestamps

Create a text index on `title` and `description` for search functionality. Create an index on `coach` and an index on `status`. Export the model.

---

### Step 29 — Create the Chapter Model

Inside `models`, create `Chapter.ts`. Define a Mongoose schema with:

- `courseId` — ObjectId, ref to Course, required
- `title` — String, required
- `order` — Number, required
- `createdAt` and `updatedAt` — via timestamps

Create an index on `courseId`. Export the model.

---

### Step 30 — Create the Lesson Model

Inside `models`, create `Lesson.ts`. Define a Mongoose schema with:

- `chapterId` — ObjectId, ref to Chapter, required
- `courseId` — ObjectId, ref to Course, required (denormalized for easier queries)
- `title` — String, required
- `order` — Number, required
- `duration` — Number, optional (in minutes)
- `tempVideoPath` — String, optional (VPS storage path before processing)
- `videoUrl` — String, optional (final video URL after processing, e.g. Google Drive embed link)
- `videoStatus` — String, enum of `pending`, `uploaded`, `ready`, default `pending`
- `createdAt` and `updatedAt` — via timestamps

Create an index on `courseId` and on `chapterId`. Export the model.

---

### Step 31 — Create the Enrollment Model

Inside `models`, create `Enrollment.ts`. Define a Mongoose schema with:

- `studentId` — ObjectId, ref to User, required
- `courseId` — ObjectId, ref to Course, required
- `receiptImageUrl` — String, optional
- `referenceNumber` — String, optional
- `amountPaid` — Number, optional
- `paymentStatus` — String, enum of `pending_review`, `approved`, `rejected`, default `pending_review`
- `reviewNotes` — String, optional
- `reviewedBy` — ObjectId, ref to User, optional
- `reviewedAt` — Date, optional
- `enrolledAt` — Date, optional (set when payment is approved)
- `createdAt` and `updatedAt` — via timestamps

Create an index on `studentId` and on `courseId`. Create a compound index on `{ studentId, courseId }` for quick lookup of whether a student is enrolled in a course. Export the model.

---

### Step 32 — Create the Progress Model

Inside `models`, create `Progress.ts`. Define a Mongoose schema with:

- `studentId` — ObjectId, ref to User, required
- `courseId` — ObjectId, ref to Course, required
- `lessonId` — ObjectId, ref to Lesson, required
- `completedAt` — Date, default now

Create a unique compound index on `{ studentId, lessonId }` to prevent duplicate completion records. Create an index on `{ studentId, courseId }` for course-level progress queries. Export the model.

---

### Step 33 — Create the Notification Model

Inside `models`, create `Notification.ts`. Define a Mongoose schema with:

- `userId` — ObjectId, ref to User, required
- `message` — String, required
- `type` — String, required (e.g. `enrollment_approved`, `course_rejected`)
- `read` — Boolean, default false
- `createdAt` — via timestamps

Create an index on `userId`. Export the model.

---

## Part 5 — Authentication API

---

### Step 34 — Create the Send OTP API Route

Create an API route at `app/api/auth/send-otp/route.ts`. This route accepts a POST request with a `whatsappNumber` field in the JSON body. It should:

1. Validate that the number is provided and is a non-empty string
2. Check if there are already 3 or more OTPSession documents for this number created in the last 10 minutes — if so, return a 429 error with a message saying too many attempts, try again later
3. Generate a random 6-digit number as the OTP
4. Hash the OTP using bcryptjs
5. Save a new OTPSession document with the hashed OTP and an `expiresAt` of 5 minutes from now
6. Call the `sendWhatsAppMessage` utility to send the OTP to the number
7. Return a 200 response with a success message. Do not return the OTP itself in the response.

---

### Step 35 — Create the Verify OTP API Route

Create an API route at `app/api/auth/verify-otp/route.ts`. This route accepts a POST request with `whatsappNumber` and `otp` fields. It should:

1. Find the most recent OTPSession for the given number where `expiresAt` is in the future
2. If no valid session is found, return a 400 error
3. Increment the `attempts` counter on the OTPSession document. If attempts exceed 5, delete the session and return a 429 error
4. Compare the submitted OTP with the stored hash using bcryptjs. If it does not match, save the updated attempts count and return a 400 error
5. If it matches, delete the OTPSession document
6. Look up the User document by `whatsappNumber`
7. If no User exists, generate a temporary short-lived JWT containing only the `whatsappNumber` and a flag `{ isNewUser: true }`, set it as a cookie, and return a response with `{ isNewUser: true }`
8. If the User exists, generate a full session JWT with `{ userId, role, whatsappNumber }`, set it as a cookie, and return `{ isNewUser: false, role: user.role }`

---

### Step 36 — Create the Complete Registration API Route

Create an API route at `app/api/auth/complete-registration/route.ts`. This route accepts a POST request with `name`, `email` (optional), and `role` (`student` or `coach`) fields. It should:

1. Verify the incoming session cookie — it should contain a `{ isNewUser: true, whatsappNumber }` payload
2. If the session is invalid or not a new-user token, return a 401 error
3. Create a new User document with the provided name, email, whatsappNumber, and role
4. If the role is `coach`, also create a CoachProfile document for this user with `verificationStatus: "pending"`
5. Generate a full session JWT with `{ userId, role, whatsappNumber }` and replace the temporary cookie with this new one
6. Return a success response with the user's role so the frontend can redirect appropriately

---

### Step 37 — Create the Logout API Route

Create an API route at `app/api/auth/logout/route.ts`. This route accepts a POST request. It should call `clearSessionCookie` to remove the session cookie and return a 200 success response.

---

### Step 38 — Create the Session API Route

Create an API route at `app/api/auth/session/route.ts`. This route accepts a GET request. It should call `getSessionUser` and return the current user's `userId`, `role`, and `whatsappNumber` if a valid session exists, or return a 401 if not. This route is used by the frontend to check login state on page load.

---

## Part 6 — Authentication UI

---

### Step 39 — Create the Login Page Route

Inside `app/(public)`, create a `login` folder and a `page.tsx` inside it. This page will host the login and registration flow. For now it should render a placeholder heading that says "Login". Confirm it loads at `/login`.

---

### Step 40 — Build the Phone Number Entry Component

Create a component called `PhoneEntry` inside `components/ui`. This component renders:

- A title: "Welcome"
- A subtitle: "Enter your WhatsApp number to get started"
- A phone number input field with a country code selector (start with a simple dropdown with a few common country codes)
- A "Send Code" button
- The component accepts an `onSubmit(phoneNumber)` callback prop
- Show a loading state on the button while waiting for the API response
- Show an inline error message if the API returns an error

---

### Step 41 — Build the OTP Entry Component

Create a component called `OTPEntry` inside `components/ui`. This component renders:

- A title: "Enter Verification Code"
- A subtitle showing the masked phone number the code was sent to (e.g., "Code sent to +94 **\* \*** 789")
- Six individual single-digit input boxes in a row — each box accepts one digit and auto-focuses the next box when filled
- A "Verify" button
- A "Resend Code" link that is disabled for 60 seconds after the code is sent, then becomes active
- The component accepts an `onSubmit(otp)` callback prop and a `onResend()` callback prop
- Show a loading state and error handling

---

### Step 42 — Build the Registration Form Component

Create a component called `RegistrationForm` inside `components/ui`. This component is shown only to new users after OTP verification. It renders:

- A title: "Create Your Account"
- A name input field (required)
- An email input field (optional), labeled as "Email (optional)"
- A role selector with two visible options styled as cards: "I want to Learn" (student) and "I want to Teach" (coach). The selected card should have a highlighted border.
- A "Create Account" button
- The component accepts an `onSubmit(name, email, role)` callback prop

---

### Step 43 — Assemble the Login Page

Open the login page file. Import and compose the three auth components (`PhoneEntry`, `OTPEntry`, `RegistrationForm`) into a multi-step flow:

- Step 1: Show `PhoneEntry`. On submit, call the send-otp API. On success, advance to step 2.
- Step 2: Show `OTPEntry`. On submit, call the verify-otp API. If the response says `isNewUser: true`, advance to step 3. If `isNewUser: false`, redirect to the appropriate dashboard based on the returned role.
- Step 3: Show `RegistrationForm`. On submit, call the complete-registration API. On success, redirect to the appropriate dashboard based on role.

Manage the current step in local state. Pass the phone number between steps as needed.

---

## Part 7 — Manager Panel Foundation

---

### Step 44 — Create the Manager Layout

Inside `app/(manager)`, create a `layout.tsx` file. This layout wraps all manager pages. It should:

- Verify the session on the server side (using `getSessionUser`) and confirm the role is `manager`. If not, redirect to `/login`.
- Render a sidebar navigation on the left and a main content area on the right
- The sidebar should contain the platform logo at the top, a nav section with placeholder links (Dashboard, Coaches, Courses, Enrollments, Users), and a Logout button at the bottom
- The layout does not need to be fully styled at this point — basic structure is sufficient

---

### Step 45 — Create the Manager Dashboard Page

Inside `app/(manager)`, create a `dashboard` folder and a `page.tsx`. This page should display four summary stat cards:

- Pending Coach Approvals
- Pending Course Reviews
- Pending Receipt Reviews
- Total Published Courses

For now, render these cards with hardcoded placeholder values (e.g., all showing "0"). The data fetching will be connected in a later step.

---

### Step 46 — Create the Manager Seed Script

Inside a `scripts` folder at the project root, create a file called `seed-manager.ts`. This script, when run directly with Node, should:

1. Connect to MongoDB using the `MONGODB_URI` environment variable
2. Accept a name and WhatsApp number as command-line arguments
3. Check if a User with that WhatsApp number already exists — if so, log a message and exit
4. Create a new User document with the given name, WhatsApp number, and `role: "manager"`, `status: "active"`
5. Log a success message and disconnect from MongoDB

This script is never exposed as an API route. It is run once on the VPS terminal to create the first manager account.

---

### Step 47 — Create the Manager Account Management API — List and Create

Create an API route at `app/api/manager/managers/route.ts`.

The GET handler should verify the session role is `manager`, then return a list of all User documents where `role: "manager"`, returning only their `_id`, `name`, `whatsappNumber`, `status`, and `createdAt` fields.

The POST handler should verify the session role is `manager`, accept a `name` and `whatsappNumber` in the request body, check that no User with that number already exists, create a new User with `role: "manager"`, and return the created user object.

---

### Step 48 — Create the Manager Account Management API — Update Status

Create an API route at `app/api/manager/managers/[id]/status/route.ts`. The PATCH handler should verify the session role is `manager`, accept an `action` field of either `suspend` or `activate`, find the User by `id`, update their `status` to `suspended` or `active` accordingly, and return the updated user. Prevent a manager from suspending their own account.

---

### Step 49 — Create the Manager Managers Page

Inside `app/(manager)`, create a `managers` page. This page should:

- Fetch the list of managers from the API on load
- Display them in a table with columns: Name, WhatsApp Number, Status, Joined Date, Actions
- The Actions column has a "Suspend" or "Activate" button depending on current status
- Include an "Add Manager" button that opens a modal form with fields for Name and WhatsApp Number
- On form submit, call the POST API and refresh the list

---

## Part 8 — Coach Verification Flow

---

### Step 50 — Create the Coach Pending Verification API

Create an API route at `app/api/manager/coaches/pending/route.ts`. The GET handler should verify the session role is `manager`, then query CoachProfile documents where `verificationStatus: "pending"`, populate the `userId` field to get the coach's name and WhatsApp number, and return the results sorted by `createdAt` ascending (oldest first).

---

### Step 51 — Create the Coach Verify API

Create an API route at `app/api/manager/coaches/[id]/verify/route.ts`. The PATCH handler should:

1. Verify the session role is `manager`
2. Accept `action` (`approved` or `rejected`) and `notes` (string, required if rejecting) in the request body
3. Find the CoachProfile by `id`
4. Update `verificationStatus`, `verificationNotes`, `verifiedBy`, and `verifiedAt` accordingly
5. Look up the coach's WhatsApp number via their `userId`
6. Send a WhatsApp notification to the coach with the outcome
7. Return the updated CoachProfile

---

### Step 52 — Create the Manager Coaches Verification Page

Inside `app/(manager)`, create a `coaches` page. This page should:

- Fetch the list of pending coach applications on load
- Display them in a table with columns: Coach Name, WhatsApp Number, Applied Date, Actions
- Each row has an "Approve" button and a "Reject" button
- Clicking "Reject" opens a modal that requires the manager to type a rejection reason before confirming
- After any action, remove the coach from the list and show a success notification

---

### Step 53 — Create the Pending Verification Screen for Coaches

Create a page inside `app/(coach)` called `pending.tsx`. This page is shown to coaches who have registered but whose account has not yet been verified by a manager. It should display:

- A message explaining that their account is under review
- The expected review timeframe (e.g., "within 24 hours")
- Their WhatsApp number so they know which account is being reviewed
- A note that they will receive a WhatsApp message when their account is approved

In the coach layout (to be created shortly), redirect coaches with `verificationStatus: "pending"` to this page.

---

## Part 9 — Coach Panel Foundation

---

### Step 54 — Create the Coach Layout

Inside `app/(coach)`, create a `layout.tsx` file. This layout should:

- Verify the session role is `coach` on the server side, redirect to `/login` if not
- Fetch the coach's CoachProfile and check `verificationStatus`. If `pending` or `rejected`, redirect to `/coach/pending`
- Render a sidebar with nav links: Dashboard, My Courses, Create Course, Students, Logout

---

### Step 55 — Create the Coach Dashboard Page

Inside `app/(coach)`, create a `dashboard` page. Display summary cards:

- Total Students (across all courses)
- Total Published Courses
- Courses Pending Review
- Draft Courses

Use hardcoded placeholder values for now. The data will be connected later.

---

## Part 10 — Course Creation Flow

---

### Step 56 — Create the Course Draft API — Create and List

Create an API route at `app/api/coach/courses/route.ts`.

The GET handler should verify the session role is `coach`, then return all Course documents where `coach` matches the logged-in user's `userId`. Include `title`, `status`, `price`, `level`, `enrollmentCount`, and `createdAt`.

The POST handler should verify the session role is `coach`, validate that `title`, `description`, `price`, and `level` are provided, create a Course document with `status: "draft"` and the coach set to the current user's `userId`, and return the created course.

---

### Step 57 — Create the Course Detail and Update API

Create an API route at `app/api/coach/courses/[id]/route.ts`.

The GET handler should return the full course document including its chapters and lessons, but only if the course belongs to the logged-in coach.

The PATCH handler should allow updating `title`, `description`, `price`, `level`, `tags`, and `thumbnailUrl`. Only allow updates if the course belongs to the logged-in coach and its status is `draft`. Return the updated course.

The DELETE handler should delete the course and all associated chapters and lessons. Only allow deletion if the status is `draft` and the course belongs to the logged-in coach.

---

### Step 58 — Create the Chapter API — Create, Update, Delete

Create an API route at `app/api/coach/courses/[id]/chapters/route.ts`. The POST handler should create a new Chapter for the given course. Assign the `order` as the current number of existing chapters plus one. Verify the course belongs to the logged-in coach.

Create an API route at `app/api/coach/courses/[id]/chapters/[chapterId]/route.ts`. The PATCH handler should allow updating the chapter title. The DELETE handler should delete the chapter and all its lessons.

---

### Step 59 — Create the Lesson API — Create, Update, Delete (Without Video)

Create an API route at `app/api/coach/courses/[id]/chapters/[chapterId]/lessons/route.ts`. The POST handler should create a new Lesson document with a title and order, linked to the chapter and course. No video upload yet.

Create an API route at `app/api/coach/courses/[id]/chapters/[chapterId]/lessons/[lessonId]/route.ts`. The PATCH handler should allow updating the lesson title. The DELETE handler should delete the lesson and, if a `tempVideoPath` exists on the lesson, delete the file from the VPS filesystem as well.

---

### Step 60 — Create the Video Upload API

Create an API route at `app/api/coach/courses/[id]/chapters/[chapterId]/lessons/[lessonId]/upload/route.ts`. This route handles the video file upload. It should:

1. Verify the session role is `coach` and the course belongs to this coach
2. Use `formidable` to parse the incoming multipart form data
3. Set the upload directory to the path in the `UPLOAD_DIR` environment variable, inside a subfolder named after the courseId
4. Set a maximum file size limit of 2GB
5. Verify the uploaded file's MIME type using the `file-type` package — only accept video MIME types (e.g., `video/mp4`, `video/quicktime`, `video/x-matroska`)
6. Rename the saved file to a UUID-based filename to avoid collisions
7. Update the Lesson document's `tempVideoPath` field with the final file path and set `videoStatus: "uploaded"`
8. Return the updated lesson

---

### Step 61 — Create the Course Submit for Review API

Create an API route at `app/api/coach/courses/[id]/submit/route.ts`. The POST handler should:

1. Verify the session role is `coach` and the course belongs to this coach
2. Check that the course has at least one chapter with at least one lesson
3. Check that the course status is currently `draft`
4. Update the course status to `pending_review`
5. Send a WhatsApp notification to the manager (use a hardcoded manager number from environment variables for now) that a new course has been submitted
6. Return the updated course

---

### Step 62 — Build the Course Builder UI — Step 1 (Course Metadata Form)

Inside `app/(coach)`, create a `courses/create` page. This is a multi-step form. Build Step 1:

- A form with fields for: Course Title, Description (textarea), Price, Level (dropdown: Beginner / Intermediate / Advanced), Tags (a tag input where the user types and presses enter to add tags)
- A "Next: Add Chapters" button that validates the form and advances to step 2
- Save the entered data in local state as the user progresses

---

### Step 63 — Build the Course Builder UI — Step 2 (Chapter and Lesson Manager)

Add Step 2 to the course builder page. This step shows:

- A list of chapters, each expandable to show its lessons
- An "Add Chapter" button that adds a new chapter row with a title input
- Within each chapter, an "Add Lesson" button that adds a lesson row with a title input and a video upload button
- Each lesson row shows its upload status (no file, uploading with progress bar, uploaded)
- A "Back" button to return to step 1
- A "Review & Submit" button to advance to step 3

---

### Step 64 — Build the Course Builder UI — Step 3 (Review and Submit)

Add Step 3 to the course builder page. This step shows a read-only summary of everything the coach has entered:

- Course title, description, price, level
- List of all chapters and their lessons with video upload status
- A warning if any lessons are missing their video upload
- A "Submit for Review" button that calls the course creation API (POST), then the chapter/lesson creation APIs, then the submit API in sequence
- A "Back" button to return to step 2
- On successful submission, redirect to the coach's course list with a success message

---

### Step 65 — Build the Coach My Courses Page

Inside `app/(coach)`, create a `courses` page. This page should:

- Fetch all of the coach's courses from the API
- Display them as cards or a table with: title, status badge (color-coded), price, enrollment count, date created
- A "Create New Course" button linking to the course builder
- For `rejected` courses, show a "View Feedback" button that expands or opens a modal showing the manager's review notes
- For `draft` courses, show an "Edit" button

---

## Part 11 — Manager Course Review Flow

---

### Step 66 — Create the Course Review Queue API

Create an API route at `app/api/manager/courses/pending/route.ts`. The GET handler should verify the session role is `manager`, query Course documents with `status: "pending_review"`, populate the `coach` field to get the coach's name, and return results sorted by `createdAt` ascending. Include title, price, level, and submission date.

---

### Step 67 — Create the Course Detail API for Manager

Create an API route at `app/api/manager/courses/[id]/route.ts`. The GET handler should verify the session role is `manager` and return the full course including all chapters, all lessons (with their `tempVideoPath` and `videoStatus`), and the coach's name and WhatsApp number.

---

### Step 68 — Create the Course Review Action API

Create an API route at `app/api/manager/courses/[id]/review/route.ts`. The PATCH handler should:

1. Verify the session role is `manager`
2. Accept `action` (`approved`, `rejected`, or `held`) and `notes` in the request body
3. Update the course `status`, `reviewNotes`, `reviewedBy`, and `reviewedAt`
4. Map the actions: `approved` → status `approved`, `rejected` → status `rejected`, `held` → status remains `pending_review` but notes are saved
5. Send a WhatsApp notification to the coach with the outcome and notes
6. Return the updated course

---

### Step 69 — Create the Course Publish API

Create an API route at `app/api/manager/courses/[id]/publish/route.ts`. The PATCH handler should verify the session role is `manager`, check that all lessons have `videoStatus: "ready"` and the course has a `previewVideoUrl`, update the course status to `published`, notify the coach via WhatsApp, and return the updated course.

Create an `unpublish` route at `app/api/manager/courses/[id]/unpublish/route.ts` that sets status to `unpublished`.

---

### Step 70 — Create the Video URL Management API

Create an API route at `app/api/manager/courses/[id]/lessons/[lessonId]/video-url/route.ts`. The PATCH handler should:

1. Verify the session role is `manager`
2. Accept a `videoUrl` string in the request body
3. Update the Lesson document's `videoUrl` field and set `videoStatus: "ready"`
4. After saving, delete the file at `tempVideoPath` from the VPS filesystem (the source video is no longer needed after the manager has uploaded it to Google Drive)
5. Clear the `tempVideoPath` field on the lesson
6. Return the updated lesson

Also add a `previewVideoUrl` PATCH route at `app/api/manager/courses/[id]/preview-url/route.ts` that updates only the course's `previewVideoUrl`.

---

### Step 71 — Build the Manager Course Review Page

Inside `app/(manager)`, create a `courses` page. It should:

- Display a table of courses pending review with columns: Title, Coach Name, Level, Price, Submitted Date, Actions
- An "Approve" button, "Reject" button, and "Hold" button per row
- "Reject" and "Hold" open a modal requiring the manager to write notes before confirming
- Clicking the course title opens a detail view (see next step)

---

### Step 72 — Build the Manager Course Detail and Video Management Page

Create a course detail page inside `app/(manager)/courses/[id]`. This page should show:

- All course metadata at the top
- Each chapter and lesson listed below it
- Per lesson: title, video status badge, and a text input field where the manager can paste the Google Drive video URL, plus a "Save URL" button
- A "Set Preview Video URL" input at the top of the page
- The publish/unpublish button — only enabled when all lessons have `videoStatus: "ready"` and a preview URL is set
- Approve / Reject / Hold buttons for courses still in review

---

## Part 12 — Student Enrollment Flow

---

### Step 73 — Create the Public Course Listing API

Create an API route at `app/api/courses/route.ts`. The GET handler should be public (no auth required). It should:

- Query Course documents with `status: "published"`
- Support query parameters: `search` (text search on title/description), `level` (filter by level), `sort` (options: `newest`, `popular`, `price_asc`, `price_desc`)
- Return a paginated list (20 per page) including: title, thumbnailUrl, previewVideoUrl, price, level, enrollmentCount, coach name, and tags
- Implement cursor-based pagination using the `_id` field

---

### Step 74 — Create the Public Course Detail API

Create an API route at `app/api/courses/[id]/route.ts`. The GET handler should be public. Return the full course detail including: all metadata, the coach's name and bio, the list of chapters with their lesson titles and durations. Do not return any `videoUrl` fields — those are for enrolled students only. Do return `previewVideoUrl` for the public preview.

---

### Step 75 — Build the Public Courses Listing Page

Inside `app/(public)`, create a `courses` page. It should:

- Fetch and display published courses as cards in a responsive grid
- Include a search bar at the top
- Include filter controls: Level dropdown, Sort dropdown
- Each course card shows: thumbnail (or placeholder), title, coach name, level badge, price, enrollment count
- Clicking a card navigates to the course detail page

---

### Step 76 — Build the Public Course Detail Page

Inside `app/(public)/courses`, create a `[id]` dynamic page. It should:

- Display the full course detail: title, description, price, coach info, level, tags
- Embed the `previewVideoUrl` in a video player for the free preview
- Show the chapter and lesson list (lesson titles and durations only, no video links)
- Show the total number of lessons and estimated total duration
- An "Enroll Now" button — if the user is not logged in, redirect to the login page. If logged in as a student, proceed to the enrollment flow.
- Show an "Already Enrolled" state if the student has an approved enrollment for this course

---

### Step 77 — Create the Enrollment Submission API

Create an API route at `app/api/student/enrollments/route.ts`.

The POST handler should:

1. Verify the session role is `student`
2. Check that the course exists and is `published`
3. Check that no approved or pending Enrollment already exists for this student and course
4. Accept `courseId`, `referenceNumber`, and a receipt image file upload using formidable
5. Save the receipt image to a dedicated receipts folder within `UPLOAD_DIR`
6. Create an Enrollment document with `paymentStatus: "pending_review"`
7. Send a WhatsApp notification to the manager that a new receipt has been submitted
8. Return the created enrollment

The GET handler should return all of the logged-in student's enrollments, populating the course title and status.

---

### Step 78 — Build the Enrollment Submission UI

Inside `app/(student)`, create an `enroll/[courseId]` page. This page should:

- Display the course title and price
- Display the platform's bank account details (name, account number, bank name — load these from environment variables)
- A text input for the bank transfer reference number
- A file upload input for the receipt image (accept images only: jpg, png, pdf)
- A preview of the selected receipt image before submission
- A "Submit Enrollment" button
- On success, redirect to the student dashboard with a confirmation message

---

### Step 79 — Create the Manager Enrollment Review API

Create an API route at `app/api/manager/enrollments/pending/route.ts`. The GET handler should return all Enrollment documents with `paymentStatus: "pending_review"`, populating student name and WhatsApp number, and course title and price.

Create an API route at `app/api/manager/enrollments/[id]/review/route.ts`. The PATCH handler should:

1. Verify the session role is `manager`
2. Accept `action` (`approved` or `rejected`) and optional `notes`
3. On approval: set `paymentStatus: "approved"`, set `enrolledAt` to now, increment the Course's `enrollmentCount` by 1
4. On rejection: set `paymentStatus: "rejected"`, save notes
5. Send a WhatsApp notification to the student with the outcome
6. Return the updated enrollment

---

### Step 80 — Build the Manager Enrollment Review Page

Inside `app/(manager)`, create an `enrollments` page. It should:

- Display a table of pending enrollments
- Columns: Student Name, WhatsApp, Course Name, Amount Claimed, Reference Number, Submitted Date, Receipt, Actions
- The Receipt column shows a thumbnail image that opens a full-size view on click
- "Approve" and "Reject" buttons per row
- "Reject" requires a notes modal before confirming

---

## Part 13 — Course Viewing and Progress

---

### Step 81 — Create the Enrolled Course Content API

Create an API route at `app/api/student/courses/[id]/content/route.ts`. The GET handler should:

1. Verify the session role is `student`
2. Verify an approved Enrollment exists for this student and course
3. Return the full course content: all chapters, all lessons with their `videoUrl` and durations
4. Also return the student's Progress records for this course (list of completed lessonIds)

If no approved enrollment exists, return a 403 error.

---

### Step 82 — Create the Progress Recording API

Create an API route at `app/api/student/progress/route.ts`. The POST handler should:

1. Verify the session role is `student`
2. Accept `lessonId` and `courseId` in the request body
3. Verify an approved enrollment exists for this student and course
4. Create a Progress document if one does not already exist for this student and lesson (use upsert)
5. Return a success response

---

### Step 83 — Build the Student Course Viewer Page

Inside `app/(student)/courses`, create a `[id]/learn` dynamic page. This is the core course watching experience. It should:

- Load the course content from the enrolled content API
- Show a sidebar with the chapter and lesson list — completed lessons show a checkmark, the current lesson is highlighted
- Show the video player in the main area embedding the lesson's `videoUrl`
- Show the lesson title and a "Mark as Complete" button below the video
- Clicking "Mark as Complete" calls the progress API and updates the sidebar
- Clicking a lesson in the sidebar loads that lesson's video
- Show the overall course completion percentage at the top of the sidebar

---

## Part 14 — Student Dashboard

---

### Step 84 — Create the Student Dashboard API

Create an API route at `app/api/student/dashboard/route.ts`. The GET handler should return:

- All of the student's enrollments grouped by status: pending, approved, rejected
- For each approved enrollment: course title, thumbnail, total lessons, completed lesson count
- The student's name

---

### Step 85 — Create the Student Layout

Inside `app/(student)`, create a `layout.tsx`. It should verify the session role is `student`, redirect to `/login` if not. Render a simple top navigation bar with links to Dashboard and Courses, and a Logout button.

---

### Step 86 — Build the Student Dashboard Page

Inside `app/(student)`, create a `dashboard` page. It should:

- Show a greeting with the student's name
- Show cards for each enrolled course with: thumbnail, title, progress bar, "Continue" button linking to the last incomplete lesson
- Show a separate section for pending enrollments with a status message: "Receipt under review — you will receive a WhatsApp confirmation within 24 hours"
- Show a "Browse Courses" link for students with no enrollments

---

## Part 15 — Coach Dashboard (Data Connected)

---

### Step 87 — Create the Coach Dashboard API

Create an API route at `app/api/coach/dashboard/route.ts`. The GET handler should return:

- Total students enrolled across all the coach's published courses
- Total published courses
- Total courses pending review
- Total draft courses
- A list of recent enrollments (last 10): student name and which course they enrolled in

---

### Step 88 — Connect the Coach Dashboard Page to the API

Update the coach dashboard page created in Step 55 to fetch real data from the dashboard API and display it in the summary cards and a recent enrollments table.

---

### Step 89 — Build the Coach Students Page

Inside `app/(coach)`, create a `students` page. It should:

- List all courses the coach has published
- Allow the coach to select a course to see its enrolled students
- For the selected course, show a table: Student Name, Enrollment Date
- Show the total student count for the selected course

---

## Part 16 — Notifications Consolidation

---

### Step 90 — Create the WhatsApp Notification Functions Library

Open `lib/whatsapp.ts` and add named, purpose-specific notification functions. Each function should construct the appropriate message text and call the base `sendWhatsAppMessage` function. Create the following:

- `notifyManagerNewCoach(managerNumber, coachName, coachNumber)`
- `notifyCoachAccountApproved(coachNumber)`
- `notifyCoachAccountRejected(coachNumber, reason)`
- `notifyManagerNewCourseSubmission(managerNumber, courseTitle, coachName)`
- `notifyCoachCourseApproved(coachNumber, courseTitle)`
- `notifyCoachCourseRejected(coachNumber, courseTitle, reason)`
- `notifyCoachCoursePublished(coachNumber, courseTitle)`
- `notifyManagerNewReceipt(managerNumber, studentName, courseTitle)`
- `notifyStudentEnrollmentApproved(studentNumber, courseTitle)`
- `notifyStudentEnrollmentRejected(studentNumber, courseTitle, reason)`
- `notifyDiskUsageHigh(managerNumber, usagePercent)` — for the disk monitoring cron job

Then update all API routes that currently send raw WhatsApp messages to use these named functions instead.

---

### Step 91 — Add OTP Rate Limiting

Return to the send-otp API route created in Step 34. Improve the rate limiting logic:

- Block the same number from requesting more than 3 OTPs within any 10-minute window
- After 5 consecutive failed verification attempts for a given number, block that number from requesting new OTPs for 30 minutes by saving a `lockedUntil` timestamp on the OTPSession
- Ensure all these checks happen before the OTP is generated and before any WhatsApp message is sent

---

## Part 17 — Manager Dashboard (Data Connected)

---

### Step 92 — Create the Manager Dashboard API

Create an API route at `app/api/manager/dashboard/route.ts`. The GET handler should return:

- Count of CoachProfiles with `verificationStatus: "pending"`
- Count of Courses with `status: "pending_review"`
- Count of Enrollments with `paymentStatus: "pending_review"`
- Count of Courses with `status: "published"`

---

### Step 93 — Connect the Manager Dashboard Page to the API

Update the manager dashboard page created in Step 45 to fetch real data and display the live counts. Add click-through links on each card that navigate to the relevant management page.

---

## Part 18 — Search and Discovery

---

### Step 94 — Enable MongoDB Text Search on Courses

Open the Course model created in Step 28 and confirm the text index on `title` and `description` is correctly defined. Then update the public course listing API from Step 73 to use the `$text: { $search: query }` operator when a `search` query parameter is present. Test that searching for a keyword returns relevant courses.

---

### Step 95 — Build the Search Bar Component

Create a `SearchBar` component in `components/ui`. It should:

- Render an input field and a search button
- On submit, update the URL query parameter `?search=...` using Next.js router
- The course listing page reads this parameter on load and passes it to the API

---

### Step 96 — Build the Course Filter Component

Create a `CourseFilters` component in `components/ui`. It should render:

- A Level dropdown (All / Beginner / Intermediate / Advanced)
- A Sort dropdown (Newest / Most Popular / Price: Low to High / Price: High to Low)
- Each selection updates URL query parameters and triggers a re-fetch of the course listing

---

## Part 19 — Security Hardening

---

### Step 97 — Add Role Verification Inside All API Route Handlers

Review every API route that has been created. Ensure each one has an explicit role check inside the handler function itself (not relying solely on middleware). The pattern is: call `getSessionUser`, check the role matches the expected role, return a 401 or 403 immediately if it does not. This is a second layer of security in addition to the middleware.

---

### Step 98 — Prevent Unauthorized File Access

Update the Nginx configuration (document this as instructions, not code) to block direct HTTP access to the uploads directory. Files in the uploads folder should only be served through authenticated API routes, never directly by URL. Create an API route at `app/api/files/[...path]/route.ts` that:

1. Verifies a valid session exists
2. Checks that the requesting user has permission to access the requested file (e.g., a receipt image can only be accessed by a manager or the student who uploaded it; a lesson video can only be accessed by an enrolled student or a manager)
3. Streams the file from the filesystem in the response

Update all existing references to uploaded file paths to use this route instead of direct file paths.

---

### Step 99 — Add Input Validation to All API Routes

Review every API route and ensure that all user-supplied fields are validated before use. Specifically:

- All required fields are checked for presence and correct type
- String fields that should not contain HTML are stripped of any HTML tags
- ObjectId fields are validated to be valid MongoDB ObjectId format before being used in queries
- Numeric fields are validated to be actual numbers within reasonable ranges (e.g., course price cannot be negative)

Return a descriptive 400 error for any validation failure.

---

### Step 100 — Add the Disk Usage Monitor Script

Inside the `scripts` folder, create a file called `disk-monitor.ts`. This script, when run by a cron job, should:

1. Check the disk usage percentage of the VPS uploads directory
2. If usage exceeds 70%, call `notifyDiskUsageHigh` with the manager's WhatsApp number and the current usage percentage
3. Log the check result with a timestamp

Document the cron job setup command that should be run on the VPS to run this script every hour.

---

## Part 20 — Final Polish and Pre-Launch

---

### Step 101 — Add Loading and Error States to All Pages

Review all pages across student, coach, and manager panels. Ensure every page that fetches data has:

- A loading skeleton or spinner shown while data is being fetched
- A clear error message shown if the fetch fails
- An empty state message shown when data is fetched successfully but the list is empty (e.g., "No courses yet. Create your first course!")

---

### Step 102 — Add WhatsApp Notification Logging

Create a simple logging mechanism: every time a WhatsApp message is sent via the utility function, write a log entry to a `logs/whatsapp.log` file on the VPS with a timestamp, the recipient number, and the message type (not the full message text, for privacy). This creates an audit trail and helps debug notification failures.

---

### Step 103 — Update the Landing Page Navigation Links

Return to the Navbar component built in Step 8 and connect the navigation links:

- "Courses" links to `/courses` (the public course listing page)
- "Log In" links to `/login`
- "Get Started" links to `/login`
- "Browse Courses" in the hero links to `/courses`
- "Become a Coach" in the hero links to `/login` with a query parameter `?intent=coach` so the registration form can pre-select the coach role

---

### Step 104 — Build the 404 Page

Create a custom `not-found.tsx` page in the `app` directory. It should show a chess-themed 404 message (e.g., "Looks like this page has been checkmated") with a button to return to the homepage.

---

### Step 105 — Build the Access Denied Page

Create a simple `app/unauthorized/page.tsx` page. It should tell the user they do not have permission to access the page they requested, and offer a button to go to the homepage or log in.

---

### Step 106 — End-to-End Review Pass

This is not a coding step. It is a structured review pass. Go through the following complete user journeys manually in the browser and confirm each one works from start to finish without errors:

1. New student registers via WhatsApp OTP, browses courses, watches a preview, submits an enrollment receipt, receives WhatsApp confirmation after manager approval, watches the full course, marks lessons complete
2. New coach registers, waits for manager approval, receives WhatsApp confirmation, creates a course with chapters and lessons, uploads videos, submits for review, receives manager feedback via WhatsApp, sees the course published
3. Manager logs in, approves a coach, reviews a course, adds video URLs to all lessons, publishes the course, reviews a student receipt, approves the enrollment

Log any bugs found during this pass and fix them before considering the platform ready.

---

_End of Implementation Plan — 106 Steps_
