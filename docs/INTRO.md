# 🎯 CyberHunt: Master Project Documentation & Developer Guide

This document is the absolute source of truth for the **CyberHunt (Operation Vault / Operation Blackout)** platform. It is written to provide any developer or AI agent with a complete, start-to-finish understanding of the project's codebase, data flow, architecture, design constraints, and unresolved bugs.

---

## 1. System Overview & Concept

**CyberHunt** is a Capture the Flag (CTF) / digital treasure hunt platform developed for **TechAlfa**. 

- **The Premise:** Competitors (organized in teams of 1-2 members) must solve **10 cybersecurity/technical challenges** scattered across the web (GitHub repositories, Vercel mock pages, social media, EXIF image metadata, MD5 cracking, etc.).
- **The Fragments System:** Solving each of the first 9 levels unlocks a single-letter **"fragment"**. In Level 10 (the Boss Level), players must unscramble the collected letters to form the final Master Key (spelling **`BLACKOUTS`**).
- **The Gameplay Loop:** 
  1. Competitors log in with their **Leader Email** and unique **Team ID**.
  2. They review the active mission on their dashboard, which links to external clues.
  3. When they find the solution (the flag/fragment), they submit it along with a **Proof Screenshot** showing where they found it.
  4. Submitting instantly advances the team to the next level in the database.
  5. Administrators monitor submissions in real-time. If a submission contains plagiarized or direct AI-generated answers, the administrator can reject it and issue an **AI Strike**. Accumulating enough strikes results in team disqualification.

---

## 2. Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: React 19 & TypeScript
- **Styling**: Tailwind CSS (v4) + custom global variables defined in [globals.css](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/app/globals.css)
- **Database**: Supabase Database (PostgreSQL)
- **Authentication**: JWT-based session cookies using `jose` for edge-compatible token encryption
- **Icons**: `lucide-react`
- **Animations**: `framer-motion` (Optional/Installed)

---

## 3. Database Architecture (Supabase / Postgres)

The relational database structure consists of five primary tables initialized and populated via the `/api/seed` route (with migration script inside [supabase/schema.sql](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/supabase/schema.sql)):

### 1. `teams` (Table)
Represents an active competitor group.
- `team_id` (TEXT, PRIMARY KEY): Unique identifier (e.g., `"TEST-ALPHA"`).
- `team_name` (TEXT): Display name.
- `leader_email` (TEXT): Team leader email used for login.
- `current_level` (INTEGER): Active level (1 to 10). When a team completes Level 10, this becomes 11.
- `score` (INTEGER): Cumulative points (starts at 0, increases by 1000 per level completion minus hint penalties).
- `fragments` (TEXT[]): 9 slots representing unlocked single-letter fragments (e.g., `["C", "Y", "B", "", "", "", "", "", ""]`).
- `ai_strikes` (INTEGER): Active strike count (admin-applied).
- `global_hints_used` (INTEGER): Counter of unlock hints requested.
- `is_disqualified` (BOOLEAN): Flag blocking dashboard access if true.
- `started_at` (TIMESTAMP WITH TIME ZONE): Tracked when the team first loads the dashboard.
- `last_submission_at` (TIMESTAMP WITH TIME ZONE): Timestamp of the last correct submission.

### 2. `levels` (Table)
Configuration for each of the 10 missions.
- `level_id` (INTEGER, PRIMARY KEY): `1` through `10`.
- `hint_1` (TEXT): Unlockable hint.
- `hint_link` (TEXT): Optional external URL to assist.

### 3. `submissions` (Table)
The queue of attempts filed by teams.
- `id` (UUID, PRIMARY KEY): Generated automatically.
- `team_id` (TEXT, FOREIGN KEY): Submitting team referencing `teams(team_id)`.
- `team_name` (TEXT): Submitting team name.
- `level_id` (INTEGER): Level attempted.
- `answer` (TEXT): Raw submitted text flag.
- `proof_url` (TEXT): Base64 compressed image string (JPG).
- `status` (TEXT): `"pending" | "approved" | "rejected" | "rejected_ai"`.
- `timestamp` (TIMESTAMP WITH TIME ZONE): Submission time.

### 4. `activity_logs` (Table)
Chronological activity logs feeding the live dashboards.
- `id` (UUID, PRIMARY KEY): Generated automatically.
- `message` (TEXT): Display text.
- `timestamp` (TIMESTAMP WITH TIME ZONE): Log date.

### 5. `event_settings` (Table)
Global flags controlling the event.
- `id` (TEXT, PRIMARY KEY): Configuration identifier (`"config"`).
- `start_time` (TIMESTAMP WITH TIME ZONE): Global timer start.
- `end_time` (TIMESTAMP WITH TIME ZONE): Global timer end.
- `is_active` (BOOLEAN): Active status.

---

## 4. Application Routes & Flow

### Frontend Pages:
- **`/` (Landing Page)**: Login interface matching Email + Team ID (under [src/app/page.tsx](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/app/page.tsx)).
- **`/rules`**: Operational onboarding rules verification screen (under [src/app/rules/page.tsx](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/app/rules/page.tsx)).
- **`/dashboard`**: Player command center showing current level instructions, time-unlocked hints, submitting solution inputs, proof uploads, live feed, scoreboard, and fragment slots (under [src/app/dashboard/page.tsx](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/app/dashboard/page.tsx)).
- **`/admin/submissions`**: Admin terminal for approving/rejecting screenshots and executing strikes (under [src/app/admin/submissions/page.tsx](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/app/admin/submissions/page.tsx)).
- **`/leaderboard`**: Stands standings, rendering sorted ranking results (under [src/app/leaderboard/page.tsx](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/app/leaderboard/page.tsx)).
- **`/results`**: End-game scoreboard showing final winners podium (under [src/app/results/page.tsx](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/app/results/page.tsx)).
- **`/complete`**: The end screen rendering unlocked fragments and assembling the master password (under [src/app/complete/page.tsx](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/app/complete/page.tsx)).

### Backend APIs:
- **`POST /api/auth/login`**: Authenticates credentials, signs JWT via `signToken()`, and writes cookie `cyberhunt_token`.
- **`GET /api/auth/me`**: Reads the `cyberhunt_token` cookie and returns user details.
- **`GET /api/dashboard`**: Hydrates current team stats, live feed logs, and other teams' levels (active agents scoreboard).
- **`POST /api/dashboard/action`**:
  - `action: "submit"`: Records submission and updates current level, score, and unlocked fragments.
  - `action: "hint"`: Increments hints count in database and returns the decrypted hint text.
- **`GET /api/admin/submissions`**: Gathers all submissions, cross-referencing team document fields to retrieve strikes.
- **`POST /api/admin/action`**: Action endpoints for `approve`, `reject`, and `strike` (adding AI strikes and tracking disqualifications).
- **`GET /api/leaderboard`**: Retrieves active teams, sorting in-memory by Score (desc), Level (desc), and Submission Time (asc).
- **`GET /api/results`**: Retrieves final winners once `results_published` is toggled.
- **`GET /api/seed`**: Resets Supabase tables and inserts mock levels, teams, event settings, and system logs.

---

## 5. Architectural Mechanisms to Keep in Mind

1. **Client-Side Canvas Image Compression**:
   Storing full-resolution files inside database tables can be highly inefficient and slow. To avoid using external storage buckets, the frontend compresses proof screenshots before transmission.
   - When a user uploads a file, it reads it inside a `FileReader`.
   - It draws it onto an HTML `<canvas>` with a maximum width of `800px`.
   - It converts the canvas contents to a Base64-encoded JPEG with `0.6` quality.
   - This string is posted to the backend as `proofBase64` and stored inside Firestore directly.
2. **REST Polling Strategy**:
   The dashboards refresh state by polling API routes every 10 seconds via `setInterval`. Persistent WebSockets/Firestore listeners (`onSnapshot`) are intentionally avoided to limit concurrent read quotas.
3. **Session Verification**:
   All competitor-scoped routes verify user identity server-side via cookies decrypted through `jose`.

---

## 6. Known Bugs & Implementation Gaps (Critical TODOs)

To complete the app implementation, the following issues must be resolved:

1. **Leaderboard Data Mismatch**:
   - The API ([api/leaderboard/route.ts](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/app/api/leaderboard/route.ts)) returns `{ leaderboard: [...] }`.
   - The frontend ([leaderboard/page.tsx](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/app/leaderboard/page.tsx)) reads `data.teams` (`data.teams || []`). This discrepancy causes the leaderboard table to remain blank.
   - The component [LeaderboardTable](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/components/game/leaderboard-table.tsx) expects items to contain `levels_solved`, but the API returns `current_level`. (Usually, `levels_solved = current_level - 1`).
2. **Results Display Mismatch**:
   - The API ([api/results/route.ts](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/app/api/results/route.ts)) returns `{ winners: [...] }`.
   - The frontend ([results/page.tsx](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/app/results/page.tsx)) reads `data.teams` and `data.winner`.
   - When results are not published, the API returns a response containing `{ published: false }` with a status of `200`. However, the frontend checks for `res.status === 403`, meaning it will not correctly identify the unpublished status.
3. **Missing API Route Handlers**:
   - `/api/fragments` (called by [complete/page.tsx](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/app/complete/page.tsx)) is missing.
   - `/api/submit/upload` (called by [submit/page.tsx](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/app/submit/page.tsx)) is missing. (Wait, proof submissions are already handled base64-style via `/api/dashboard/action` in the updated workflow; this legacy route can either be removed or aliased).
   - `/api/hints/global` (polled by the global `HintBar` in [header.tsx](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/src/components/layout/header.tsx)) is missing.
4. **AI Strike Disqualification Rule**:
   - The rules page and dashboard alerts state that teams get disqualified upon receiving their **4th strike** (i.e. maximum 4 strikes, disqualified when strikes = 4).
   - However, the backend action handler checks `newStrikes >= 3` for disqualification. This means a team is blocked after only **3 strikes**, creating a mismatch.
5. **Middleware Unauthorized Redirect**:
   - The middleware ([middleware.ts](file:///c:/Project/Techalfa-Comunity/Cyber_Hunt/CyberHunt/middleware.ts)) redirects unauthorized users to `/login`.
   - However, the actual login page is served at root `/`. This triggers a 404 routing loop. It should redirect to `/` instead of `/login`.

---

## 7. Setup & Run Instructions

1. **Environment Config**: Create `.env.local` based on `.env.example` using your Supabase config:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-goes-here
   ADMIN_PASSPHRASE=TECHALFA_ADMIN_2026
   NEXTAUTH_SECRET=your-random-jwt-secret
   ```
2. **Installation**:
   ```bash
   npm install
   ```
3. **Database Seeding**:
   Run the development server and navigate to `http://localhost:3000/api/seed` in your browser. This resets Supabase tables and inserts mock game data.
4. **Running Locally**:
   ```bash
   npm run dev
   ```
   Access the competitor workspace at `http://localhost:3000/` and the admin area at `http://localhost:3000/admin`.
