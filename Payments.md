# Chess Course Platform — Payments System Implementation Plan

## How to Use This Document

Each step in this plan is a single, atomic task. Give one step at a time to the AI agent. Review the output before proceeding to the next step. Steps are intentionally small so that mistakes are caught early and do not cascade into later work. Never skip a step. If a step produces an unexpected result, fix it before continuing.

---

## Part 11 — Database Updates for Payments

### Step 61 — Update the Enrollment Model for Payout Tracking

Modify the existing `Enrollment` model (`src/models/Enrollment.ts`). We need a way to track which enrollments have had their revenue paid out to the coach.
Add two new fields to the `EnrollmentSchema`:

- `coachPayoutStatus` — String, enum of `pending`, `paid`, default `pending`.
- `coachPaidAt` — Date, optional.

Create a new index on `{ coachPayoutStatus: 1, paymentStatus: 1 }` to optimize queries for pending payouts. Export the updated model.

---

## Part 12 — Manager Payments API & Backend

### Step 62 — Create the Manager Payments Summary API

Create an API route at `src/app/api/manager/payments/route.ts` with a `GET` handler.

1. Verify the session role is `manager`.
2. Query all `Enrollment` documents where `paymentStatus` is `approved`. Populate the associated `courseId` (to get `price`, `coach`, and `platformFee`).
3. Calculate the global summary:
   - **Total Owed to Coaches**: Sum of (`amountPaid` \* ((100 - `platformFee`) / 100)) for all enrollments where `coachPayoutStatus === 'pending'`.
   - **Total Platform Revenue Generated**: Sum of (`amountPaid` \* (`platformFee` / 100)) for all approved enrollments.
   - **Developer Cut**: 5% of the Total Platform Revenue Generated.
4. Calculate the coach breakdown:
   - Group the pending enrollments by coach.
   - For each coach, calculate their specific "Pending Payout Amount" and "Number of Unpaid Enrollments".
   - Include coach details (Name, WhatsApp Number).
5. Return the global summary and the array of coach breakdowns.

---

### Step 63 — Create the Manager Execute Payout API

Create an API route at `src/app/api/manager/payments/payout/route.ts` with a `POST` handler.

1. Verify the session role is `manager`.
2. Accept a `coachId` in the request body.
3. Find all `Enrollment` documents where `paymentStatus === 'approved'`, `coachPayoutStatus === 'pending'`, and the populated course's coach matches `coachId`.
4. Calculate the total payout amount for these enrollments to include in the notification.
5. Update all these matched Enrollment documents: set `coachPayoutStatus` to `paid` and `coachPaidAt` to the current date.
6. Use the `sendWhatsAppMessage` utility to notify the coach (e.g., "Your payout of Rs. X for recent course enrollments has been processed via bank transfer!").
7. Return a success response.

---

## Part 13 — Manager Payments Frontend

### Step 64 — Build the Manager Payments Page Shell & Summary

Inside `src/app/(manager)/manager/payments/page.tsx`, create the main payments view.

1. Fetch the data from the `GET /api/manager/payments` route.
2. Render a top section with three prominent Summary Cards: "Total Owed To Coaches", "Total Platform Revenue", and "Developer Cut (5%)". Design these cards using premium styling, gradients, and icons.
3. Handle loading skeletons and empty states gracefully.

---

### Step 65 — Build the Manager Payments Coach Table & Interactions

Continue expanding `src/app/(manager)/manager/payments/page.tsx`.

1. Below the summary cards, render a data table listing all coaches who are owed money.
2. Table columns: Coach Name, WhatsApp Number, Pending Enrollments, Owed Amount, and an Actions column.
3. The Actions column should contain a high-visibility "Mark as Paid" button.
4. When "Mark as Paid" is clicked, trigger a confirmation modal warning the manager that a WhatsApp message will be sent and this action cannot be undone.
5. Upon confirmation, call the `POST /api/manager/payments/payout` API, show a loading spinner, and upon success, refresh the page data so the coach's owed amount drops to zero (or removes them from the pending list).
6. Hook this new page up to the Manager Navigation Sidebar.

---

## Part 14 — Coach Billing API & Backend

### Step 66 — Create the Coach Billing Summary API

Create an API route at `src/app/api/coach/billing/route.ts` with a `GET` handler.

1. Verify the session role is `coach`.
2. Query all `Course` documents owned by this coach.
3. Query all `Enrollment` documents linked to these courses where `paymentStatus === 'approved'`.
4. Calculate global stats for this coach:
   - **Lifetime Pure Revenue**: Sum of all coach cuts from all time.
   - **Pending Payout**: Sum of coach cuts for enrollments where `coachPayoutStatus === 'pending'`.
   - **Total Enrolled Students**: Count of all approved enrollments.
5. Generate a per-course breakdown:
   - For each course, list the Title, Enrolled Students, and Lifetime Pure Revenue generated specifically by that course (excluding platform fees and discounts).
6. Return the global stats and the detailed course array.

---

## Part 15 — Coach Billing Frontend

### Step 67 — Build the Coach Billing Page

Inside `src/app/(coach)/coach/billing/page.tsx`, create the coach's revenue dashboard.

1. Fetch the data from `GET /api/coach/billing`.
2. Display a top row of Summary Cards: "Lifetime Revenue", "Pending Payout", and "Total Students". Make the "Pending Payout" card visually distinct (e.g., green highlight) to indicate money they are waiting to receive.
3. Below, display a "Revenue By Course" table with columns: Course Title, Total Students, and Total Revenue Generated.
4. Add premium styling, ensuring empty states exist to prompt coaches to publish courses if they have none.
5. Hook this new page up to the Coach Navigation Sidebar.
