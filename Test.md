# Caissa Course Platform — End-to-End Testing Plan

> **Testing Order:** Manager → Coach → Student (since the manager must approve coaches and enrollments)
>
> **Prerequisites:**
>
> - App running locally: `npm run dev` → `http://localhost:3000`
> - MongoDB connected and accessible
> - `.env.local` configured with all required variables
> - At least one manager account created (via admin login or seeded)

---

## 🧭 Navigation & Public Pages

### 1. Landing Page (`/`)

- [ ] Page loads with hero section, Lottie illustration, and feature cards
- [ ] **Navbar** links work:
  - [ ] "Courses" → navigates to `/courses`
  - [ ] "Log In" → navigates to `/login`
  - [ ] "Get Started" → navigates to `/login`
- [ ] **Hero** buttons work:
  - [ ] "Browse Courses" → navigates to `/courses`
  - [ ] "Become a Coach" → navigates to `/login?intent=coach`
- [ ] **Footer** links:
  - [ ] "Browse Courses" → `/courses`
  - [ ] "Become a Coach" → `/login?intent=coach`
- [ ] Mobile hamburger menu opens/closes and all links work
- [ ] Trust indicators, feature sections, and footer render properly

### 2. 404 Page

- [ ] Navigate to any non-existent URL (e.g., `/nonexistent-page`)
- [ ] Verify the Lottie animation plays
- [ ] "Back to Home" button → `/`
- [ ] "Browse Courses" button → `/courses`
- [ ] "Go back" link navigates to previous page

### 3. Access Denied Page (`/unauthorized`)

- [ ] Navigate to `/unauthorized`
- [ ] "Log In" button → `/login`
- [ ] "Go to Homepage" button → `/`
- [ ] "Go back" link works

---

## 👔 Journey 1 — Manager

### 4. Manager Login (`/admin`)

- [ ] Navigate to `/admin`
- [ ] Enter incorrect credentials → error message shown
- [ ] Enter correct username & password → OTP sent via WhatsApp
- [ ] Enter incorrect OTP → error message shown
- [ ] Enter correct OTP → redirected to manager dashboard
- [ ] Session persists on page refresh

### 5. Manager Dashboard (`/manager/dashboard`)

- [ ] Dashboard loads with 4 stat cards showing live counts
- [ ] Loading spinners appear while data fetches
- [ ] Verify counts match actual DB data:
  - [ ] Pending Coach Approvals
  - [ ] Pending Course Reviews
  - [ ] Pending Enrollment Reviews
  - [ ] Published Courses
- [ ] Each stat card is clickable → navigates to its management page
- [ ] If fetch fails, error banner appears

### 6. Coach Management (`/manager/coaches`)

- [ ] Page loads with list of pending coach applications
- [ ] Each coach card shows name, phone, and verification status
- [ ] **Approve** a coach:
  - [ ] Click approve → status changes to "approved"
  - [ ] Coach receives WhatsApp notification
- [ ] **Reject** a coach:
  - [ ] Enter rejection reason
  - [ ] Click reject → status changes to "rejected"
  - [ ] Coach receives WhatsApp notification
- [ ] Empty state message shows when no pending coaches

### 7. Manager Management (`/manager/managers`)

- [ ] Page loads with list of existing managers
- [ ] **Add a new manager:**
  - [ ] Fill in Name, Email, Username, Password
  - [ ] Submit → new manager appears in the list
- [ ] **Activate/deactivate** a manager → status toggles
- [ ] Error shown if duplicate username submitted

### 8. Course Review (`/manager/courses`)

- [ ] Page loads with list of courses in "in_review" status
- [ ] Click a course → navigates to the review detail page

### 9. Course Review Detail (`/manager/courses/[id]`)

- [ ] Course details load: title, description, level, price, coach name
- [ ] Chapter list with expandable lessons visible
- [ ] Each lesson shows title, duration
- [ ] Video preview works (if video URL is set)
- [ ] **Approve** course:
  - [ ] Click approve → course status changes to "approved"
  - [ ] Coach receives WhatsApp notification
- [ ] **Reject** course:
  - [ ] Enter review notes/reason
  - [ ] Click reject → course status changes to "rejected"
  - [ ] Coach receives WhatsApp notification with reason
- [ ] **Put on hold:**
  - [ ] Click on-hold → course status changes to "on_hold"
  - [ ] Coach receives WhatsApp notification
- [ ] **Publish** an approved course:
  - [ ] Click publish → status changes to "published"
  - [ ] Coach receives WhatsApp notification
- [ ] **Unpublish** a published course → status reverts

### 10. Enrollment Review (`/manager/enrollments`)

- [ ] Page loads with list of pending enrollment requests
- [ ] Each entry shows student name, course title, receipt image
- [ ] Click the receipt image → opens/previews through `/api/files/` route
- [ ] **Approve** an enrollment:
  - [ ] Click approve → payment status changes to "approved"
  - [ ] Student receives WhatsApp notification
- [ ] **Reject** an enrollment:
  - [ ] Enter rejection reason
  - [ ] Click reject → payment status changes to "rejected"
  - [ ] Student receives WhatsApp notification
- [ ] Empty state message shows when no pending enrollments

### 11. Manager Logout

- [ ] Click logout → redirected to admin login page
- [ ] Trying to access `/manager/dashboard` without session → redirected

---

## 🎓 Journey 2 — Coach

### 12. Coach Registration (`/login`)

- [ ] Navigate to `/login`
- [ ] Enter a WhatsApp number → OTP sent
- [ ] Verify OTP → if new user, registration form appears
- [ ] Fill in registration form:
  - [ ] Name (required)
  - [ ] Role: select "Coach"
  - [ ] Profile photo upload (optional)
- [ ] Submit → redirected to coach pending page
- [ ] Manager receives WhatsApp notification about new coach application

### 13. Coach Pending Page (`/coach/pending`)

- [ ] Shows "Your application is under review" message
- [ ] Cannot access dashboard while pending
- [ ] After manager approves (do this in another browser/session):
  - [ ] Refresh → redirected to coach dashboard
  - [ ] Coach receives WhatsApp approval notification

### 14. Coach Dashboard (`/coach/dashboard`)

- [ ] Dashboard loads with 4 stat cards:
  - [ ] Total Students
  - [ ] Published Courses
  - [ ] Pending Review
  - [ ] Drafts
- [ ] Loading spinners appear while fetching
- [ ] If fetch fails, error banner appears
- [ ] Quick action cards: "Create New Course", "Manage Courses"
- [ ] Recent enrollments table populates (will be empty initially)

### 15. Create a New Course (`/coach/courses/new`)

- [ ] Navigate to course builder via "Create New Course"
- [ ] **Step 1 — Course Details:**
  - [ ] Enter title (required)
  - [ ] Enter description (required)
  - [ ] Select level: Beginner / Intermediate / Advanced
  - [ ] Enter price (must be ≥ 0)
  - [ ] Add tags
  - [ ] Validation errors shown for missing/invalid fields
  - [ ] Save → course created in "draft" status
- [ ] **Step 2 — Chapters:**
  - [ ] Add Chapter → new chapter card appears
  - [ ] Edit chapter title
  - [ ] Reorder chapters (drag or arrow buttons)
  - [ ] Delete a chapter → confirms and removes
- [ ] **Step 3 — Lessons:**
  - [ ] Select a chapter → add lessons
  - [ ] Enter lesson title
  - [ ] Upload a video file (check 2GB limit, video-only MIME check)
  - [ ] Upload progress indicator shows
  - [ ] Video preview available after upload
  - [ ] Delete a lesson → confirms and removes
- [ ] **Step 4 — Preview & Submit:**
  - [ ] Course summary displays correctly
  - [ ] Click "Submit for Review"
  - [ ] Course status changes to "in_review"
  - [ ] Manager receives WhatsApp notification

### 16. Coach Courses List (`/coach/courses`)

- [ ] All courses listed with status badges (Draft, In Review, Published, etc.)
- [ ] Click a draft course → opens course builder to edit
- [ ] Rejected courses show review notes from manager
- [ ] Status filter dropdown works
- [ ] Empty state message when no courses exist

### 17. Coach Students (`/coach/students`)

- [ ] Page loads with course selector dropdown
- [ ] Select a published course → student list loads
- [ ] Student table shows name, WhatsApp number, enrollment date
- [ ] Empty state: "No students enrolled yet"
- [ ] Loading spinner for student fetch
- [ ] Error state if fetch fails

### 18. Edit a Draft Course

- [ ] Navigate to an existing draft course
- [ ] Update title, description, price → changes persist
- [ ] Add/remove chapters and lessons → changes persist
- [ ] Cannot edit a published or in-review course directly

### 19. Delete a Draft Course

- [ ] On the courses list, delete a draft course
- [ ] Course is removed from the list
- [ ] Associated chapters & lessons are also deleted

### 20. Coach Logout

- [ ] Click logout → redirected to login page
- [ ] Trying to access `/coach/dashboard` without session → redirected

---

## 🎒 Journey 3 — Student

### 21. Student Registration (`/login`)

- [ ] Navigate to `/login`
- [ ] Enter WhatsApp number → OTP sent
- [ ] **Rate limiting test:**
  - [ ] Request 3 OTPs in quick succession → 4th should be blocked ("Too many OTP requests")
- [ ] Enter OTP correctly → registration form (if new user)
- [ ] **OTP lockout test:**
  - [ ] Enter wrong OTP 5 times → number locked for 30 minutes
  - [ ] Trying to send new OTP during lockout → error with remaining minutes shown
- [ ] Fill in registration:
  - [ ] Name (required)
  - [ ] Role: "Student" (default)
  - [ ] Profile photo (optional)
- [ ] Submit → redirected to student dashboard

### 22. Student Dashboard (`/student/dashboard`)

- [ ] Dashboard loads with:
  - [ ] Welcome message with student name
  - [ ] Enrolled courses section
  - [ ] Progress tracking per course
- [ ] Empty state message when no enrollments exist
- [ ] "Browse Courses" CTA shown

### 23. Browse Public Courses (`/courses`)

- [ ] Page loads with published courses in a card grid
- [ ] **Search:**
  - [ ] Type in the search bar → results filter after debounce
  - [ ] Search term appears in URL (`?search=chess`)
  - [ ] Clear search → all courses show again
- [ ] **Level Filter:**
  - [ ] Select "Beginner" → only beginner courses shown
  - [ ] URL updates (`?level=beginner`)
  - [ ] Select "All Levels" → all courses shown
- [ ] **Sort:**
  - [ ] "Newest" → newest courses first
  - [ ] "Most Popular" → sorted by enrollment count
  - [ ] "Price: Low → High" → ascending price
  - [ ] "Price: High → Low" → descending price
- [ ] **Shareable URLs:**
  - [ ] Copy the URL with filters → paste in new tab → same filters applied
- [ ] Loading spinner while fetching
- [ ] Infinite scroll / pagination loads more courses
- [ ] Empty state when no courses match filters

### 24. Course Detail Page (`/courses/[id]`)

- [ ] Navigate by clicking a course card
- [ ] Page shows:
  - [ ] Title, description, level badge, price
  - [ ] Coach name and bio
  - [ ] Enrollment count
  - [ ] Chapter list with lesson titles and durations
  - [ ] Video URLs are NOT exposed (only titles)
- [ ] "Enroll Now" button visible → navigates to enrollment page

### 25. Enrollment (`/courses/[id]/enroll`)

- [ ] Must be logged in as student (redirect to login if not)
- [ ] Shows course name and price
- [ ] Upload payment receipt image:
  - [ ] Select an image file → preview shown
  - [ ] Submit → enrollment created with "pending" status
  - [ ] Manager receives WhatsApp notification about new receipt
- [ ] If already enrolled, show appropriate message
- [ ] Receipt image uploaded via `/api/files/` route (not direct `/uploads/`)

### 26. Enrollment Approved (Manager Action)

- [ ] Manager approves the student's enrollment (from manager panel)
- [ ] Student receives WhatsApp notification
- [ ] Student dashboard now shows the enrolled course
- [ ] Course progress starts at 0%

### 27. Learning Page (`/courses/[id]/learn`)

- [ ] Navigate via "Continue Learning" on student dashboard
- [ ] Must have approved enrollment (403 if not enrolled)
- [ ] Page shows:
  - [ ] Chapter sidebar with lesson list
  - [ ] Current lesson video player
  - [ ] Lesson title
- [ ] Click a lesson → video loads and plays
- [ ] **Mark lesson complete:**
  - [ ] Click "Mark as Complete" → progress recorded
  - [ ] Lesson gets a checkmark in the sidebar
  - [ ] Progress percentage updates
- [ ] Cannot access lessons of unenrolled courses
- [ ] All chapters and lessons display in correct order

### 28. Student Logout

- [ ] Click logout → redirected to login page
- [ ] Trying to access `/student/dashboard` without session → redirected
- [ ] Trying to access `/courses/[id]/learn` without session → redirected

---

## 🔒 Security & Edge Cases

### 29. Role-Based Access Control

- [ ] As a student, try accessing `/coach/dashboard` → redirected/blocked
- [ ] As a student, try accessing `/manager/dashboard` → redirected/blocked
- [ ] As a coach, try accessing `/manager/dashboard` → redirected/blocked
- [ ] As a coach, try accessing `/student/dashboard` → redirected/blocked
- [ ] Unauthenticated user accessing any protected route → redirected to login
- [ ] Direct API access with wrong role returns 401/403

### 30. File Access Security

- [ ] Try accessing a file directly: `http://localhost:3000/uploads/receipts/somefile.jpg`
  - [ ] Should be blocked (404 or served by Next.js static, but on production Nginx blocks it)
- [ ] Access via authenticated route: `/api/files/receipts/somefile.jpg`
  - [ ] As manager → file served ✅
  - [ ] As student (not the uploader) → 403 Access Denied ❌
- [ ] Access course video via `/api/files/courses/[courseId]/video.mp4`
  - [ ] As enrolled student → file served ✅
  - [ ] As unenrolled student → 403 Access Denied ❌
  - [ ] As unauthenticated user → 401 Unauthorized ❌

### 31. Input Validation

- [ ] Create a course with negative price → error shown
- [ ] Create a course with HTML in title (`<script>alert('xss')</script>`) → HTML stripped
- [ ] Submit an enrollment with an invalid course ID → error shown
- [ ] Try sending progress with fake lessonId/courseId → 400 error

### 32. OTP Rate Limiting

- [ ] Send 3 OTPs within 10 minutes → 4th blocked
- [ ] Fail OTP verification 5 times → number locked for 30 minutes
- [ ] During lockout, try sending new OTP → error with cooldown time

---

## 📱 Responsive Design

### 33. Mobile Responsiveness

- [ ] Test all pages at 375px width (iPhone SE)
- [ ] Test all pages at 768px width (iPad)
- [ ] Test at 1440px width (Desktop)
- [ ] Key checks:
  - [ ] Navbar collapses to hamburger menu on mobile
  - [ ] Course cards stack vertically on mobile
  - [ ] Course builder steps are usable on mobile
  - [ ] Tables scroll horizontally on small screens
  - [ ] Buttons are tap-friendly (min 44px touch target)

---

## 📋 WhatsApp Notifications Checklist

| Event                         | Recipient | Verified? |
| ----------------------------- | --------- | --------- |
| New coach registration        | Manager   | [ ]       |
| Coach approved                | Coach     | [ ]       |
| Coach rejected                | Coach     | [ ]       |
| Course submitted for review   | Manager   | [ ]       |
| Course approved               | Coach     | [ ]       |
| Course rejected (with reason) | Coach     | [ ]       |
| Course put on hold            | Coach     | [ ]       |
| Course published              | Coach     | [ ]       |
| New enrollment receipt        | Manager   | [ ]       |
| Enrollment approved           | Student   | [ ]       |
| Enrollment rejected           | Student   | [ ]       |

---

## ✅ Test Completion Summary

| Journey         | Total Tests     | Passed | Failed | Notes |
| --------------- | --------------- | ------ | ------ | ----- |
| Public Pages    | 4 sections      |        |        |       |
| Manager Journey | 8 sections      |        |        |       |
| Coach Journey   | 9 sections      |        |        |       |
| Student Journey | 8 sections      |        |        |       |
| Security        | 4 sections      |        |        |       |
| Responsive      | 1 section       |        |        |       |
| WhatsApp        | 11 items        |        |        |       |
| **TOTAL**       | **~150 checks** |        |        |       |

---

> **Testing Tips:**
>
> - Use **two browsers** (e.g., Chrome for manager, Firefox for coach/student) to test cross-role workflows
> - Check the **browser console** for JavaScript errors during each step
> - Verify **WhatsApp logs** at `logs/whatsapp.log` if `WHATSAPP_LOGGING=true` is set
> - After completing all tests, record any bugs with screenshots in a separate `Bugs.md` file
