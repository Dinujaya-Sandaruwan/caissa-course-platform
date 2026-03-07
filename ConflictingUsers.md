# Conflicting Users Authentication Restructuring Plan

This document outlines the step-by-step implementation plan for allowing a single mobile number to be associated with multiple types of accounts (Student, Coach, Manager) independently. After this update, each login page will enforce role-specific authentication, and users with multiple roles will be able to switch between their dashboards via the top bar.

## Phase 1: Database Schema Updates

1. **Remove Unique Constraint on `whatsappNumber`:** In `src/models/User.ts`, remove the `unique: true` property from the `whatsappNumber` field.
2. **Add Compound Index:** In `src/models/User.ts`, add a compound unique index for `whatsappNumber` and `role` to ensure a user can have at most one account per role: `UserSchema.index({ whatsappNumber: 1, role: 1 }, { unique: true });`.
3. **Re-evaluate `username` Constraint:** Ensure `username` is still sparse and consider if it should be scoped by role or kept system-wide unique.
4. **Database Wipe Note:** Since the database will be wiped post-update, data migration scripts to handle existing constraints are unnecessary. Proceed directly with the code changes.

## Phase 2: Authentication APIs

7. **Update `/api/auth/send-otp` (Suspension Check):** Modify the suspension check. Since a number can have multiple roles, either check if _all_ profiles are suspended, or defer the suspension check entirely to the `verify-otp` step.
8. **Update Student Login UI:** Update the frontend student login form (`/login`) to pass `{ loginType: "student" }` in the POST request to `/api/auth/verify-otp`.
9. **Update Coach Login UI:** Update the "Become a Coach" or coach login form to pass `{ loginType: "coach" }` in the POST request to `/api/auth/verify-otp`.
10. **Refactor `/api/auth/verify-otp` (Request Parsing):** Extract the `loginType` parameter from the incoming request body.
11. **Refactor `/api/auth/verify-otp` (Query All Profiles):** Instead of a simple `findOne`, execute `User.find({ whatsappNumber })` to retrieve all accounts associated with the number.
12. **Refactor `/api/auth/verify-otp` (Role Validation):** Verify if an account exists for the specific `loginType` requested. If not, return `isNewUser: true`.
13. **Refactor `/api/auth/verify-otp` (Suspension Check):** Check the suspension status of the specific `loginType` account. If suspended, deny login.
14. **Update JWT Session Payload:** Update the `SessionPayload` interface in the system (e.g., `src/lib/jwt.ts` and `src/middleware.ts`) to include an `availableRoles` object, mapping role names to their respective `userId`s (e.g., `{ student: "id1", coach: "id2" }`).
15. **Generate Multi-role Token in `verify-otp`:** When generating the JWT, populate `availableRoles` with all sibling accounts found in step 11. Set the active `role` to the requested `loginType`.
16. **Update `/api/auth/admin-login`:** Ensure the manager login endpoint also queries sibling accounts, generates the `availableRoles` object, and issues a token that supports role switching.

## Phase 3: Registration & Profile Creation

17. **Refactor Student Registration:** Update `/api/auth/complete-registration` to create a `User` document explicitly with `role: "student"`, safely ignoring if a coach account already exists for that number.
18. **Refactor Coach Registration:** Update the coach application endpoint to create a `User` document explicitly with `role: "coach"`.
19. **Implement Auto-fill Logic:** If a user registers for a new role but already has another role under the same number, pre-fill their name, email, and profile photo using data from their sibling account.
20. **Update JWT in Registration Endpoints:** When registration finishes and issues a new session cookie, ensure it fetches all sibling accounts and populates `availableRoles` so the new session is fully multi-role capable.
21. **Test Registration Flows:** Manually test registering a coach account using an existing student's mobile number, ensuring both accounts exist independently.

## Phase 4: Middleware & Protected Routes

22. **Update `SessionPayload` in `middleware.ts`:** Sync the middleware's session interface to understand `availableRoles`.
23. **Verify Active Role Checks:** Ensure `middleware.ts` continues to validate routing based strictly on `session.role` (the currently active role).
24. **Verify Suspension Checks:** Ensure `middleware.ts` handles suspension redirects correctly based on the active session role.
25. **Block Cross-Role Direct Access:** Verify that a user logged in actively as a `"student"` gets redirected to login if they manually navigate to `/coach/dashboard`, prompting them to use the role-switch feature.
26. **Test Auth Page Redirections:** Ensure that hitting `/login` while actively logged in still redirects to the active role's dashboard.

## Phase 5: Top Bar & Role Switching Mechanism

27. **Create `/api/auth/switch-role` Endpoint:** Create a new API route dedicated to switching active roles.
28. **Implement Role Verification:** In the switch-role endpoint, validate that the requested `targetRole` exists inside the current session token's `availableRoles`.
29. **Reissue Session Token:** Generate a fresh JWT where `userId` and `role` are swapped to the target role, while preserving `availableRoles`.
30. **Return Redirect URL:** Have the `/api/auth/switch-role` endpoint return the URL of the corresponding dashboard (e.g., `/coach/dashboard` or `/student/dashboard`).
31. **Fetch Session in Top Bar:** Update the frontend Top Bar or Header component to parse or fetch the current session's `availableRoles`.
32. **Implement Role Switcher UI:** Add a dropdown or toggle button in the Top Bar that appears only if multiple roles are available, allowing instant switching between dashboards.

## Phase 6: Admin Dashboard & Synchronization

33. **Update Users List Interface:** Update the Manager Dashboard's Student and Coach lists to ensure they fetch data efficiently, considering multiple user documents per number.
34. **Implement Per-Role Suspension:** Make sure the admin panel suspends users based on their specific `User._id` rather than completely blacklisting the `whatsappNumber` across all roles.
35. **Fix Coach Joins:** Ensure queries that join `CoachProfile` with `User` still work flawlessly using the specific `userId` references.
36. **Update Global Search:** Modify admin search functions so that searching for a mobile number can clearly list distinct accounts (e.g., "Student Profile" and "Coach Profile" as separate results).
37. **Profile Sync Policy Decision:** Decide whether updating a user's name/email in the admin dashboard should sync across all their sibling accounts or remain independent.
38. **Implement Sync Hooks (Optional):** If keeping profiles synced is desired, implement Mongoose `post-save` hooks on the `User` model to replicate global changes (like `name` or `profilePhoto`) to sibling documents sharing the same `whatsappNumber`.
