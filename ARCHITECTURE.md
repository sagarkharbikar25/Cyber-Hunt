# CYBERHUNT: System Architecture & Implementation Guide

This document serves as the comprehensive source of truth for the **CyberHunt (Operation Vault / Operation Blackout)** platform. It is designed to be fed to any AI agent or developer to understand the complete system state, database schema, design philosophy, and API architecture without breaking existing functionality.

---

## 1. Tech Stack Overview
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS (v4) + Vanilla CSS (CSS Variables for dynamic theming)
- **Database**: Firebase Firestore (NoSQL)
- **Hosting**: Vercel (Target)

### Required Libraries (Dependencies)
The following third-party packages were installed to power the system:
- **`firebase`**: Client SDK for Firestore and Auth (if used).
- **`firebase-admin`**: Server-side SDK used in API routes for secure database transactions.
- **`lucide-react`**: Provides the modern, clean SVG icons used in the dashboard UI.
- **`jose`**: Used for lightweight, edge-compatible JWT token encryption and decryption for secure session cookies.
- **`framer-motion`**: *(Optional/Installed)* Available for advanced component animations.
- **`@supabase/supabase-js` & `resend`**: *(Legacy/Unused in this context but present in package.json)*.

---

## 2. Design Philosophy: The "Cyber Cockpit"
The entire application follows a strict "Cyberpunk Hacker" aesthetic. 
- **Colors**: Neon Green (`#00ff88`), Warning Amber (`#ffaa00`), Critical Red (`#ff3333`), Dark Backgrounds (`#0a0f14`).
- **Typography**: `Orbitron` (Headers/Logos), `Share Tech Mono` (Data/Numbers), `Rajdhani` (Body text).
- **Animations**: Blinking, pulse, and scanline effects are heavily utilized to create an immersive, high-stakes environment.

---

## 3. Database Schema (Firestore)

### `teams` (Collection)
Represents a participating squad.
- `team_id` (string): Unique identifier (e.g., "TEST-ALPHA").
- `team_name` (string): Display name.
- `leader_email` (string): Contact email for the team leader.
- `score` (number): Current score (decreases with hints, increases with level completion).
- `current_level` (number): The mission level they are currently on (1 to 10).
- `fragments` (array of strings): 9 slots representing the pieces of the final flag they collect.
- `ai_strikes` (number): Number of rejected submissions. 3 strikes = Disqualification.
- `global_hints_used` (number): Number of hints requested.
- `is_disqualified` (boolean): If true, locks the team out of the dashboard.
- `startedAt` (timestamp): When the team first logged in (used for 90-minute timer).
- `last_submission_at` (timestamp): Used to break ties in the leaderboard.

### `levels` (Collection)
Configuration for the 10 missions.
- `level_id` (string): "1" through "10".
- `answer_hash` (string): The correct string answer for the level.
- `fragment` (string): The piece of the final flag rewarded upon completion.
- `hint_1` (string): Text hint.
- `hint_link` (string): Optional external URL to assist with the hint.

### `submissions` (Collection)
When a team attempts to solve a level.
- `team_id` (string)
- `team_name` (string)
- `level_id` (number)
- `answer` (string): The text they submitted.
- `proofBase64` (string): Compressed base64 JPEG of their screenshot. *(Note: We use Base64 to bypass Firebase Storage setup/paywalls).*
- `status` (string): `"pending" | "approved" | "rejected"`
- `timestamp` (timestamp)

### `activity_logs` (Collection)
Used to populate the live feed / system alerts.
- `message` (string)
- `timestamp` (timestamp)

### `event_settings` (Collection)
Global event controls.
- Document `config`: 
  - `is_paused` (boolean)
  - `event_start` (timestamp)

---

## 4. Application Routes (Frontend)

1. **`/` (Login Page)**
   - Teams enter their Email and Passcode.
   - Hidden Admin portal accessible via a secret UI toggle or specific passcode.

2. **`/dashboard` (Participation Dashboard)**
   - **Top Bar**: Timer, strikes, hints used, and secured fragments.
   - **Left Column**: Live Scoreboard showing all active teams, their current level, and dynamic visual "pips" indicating progress.
   - **Center Column**: Mission Control. Displays the current level's prompt, time-locked hints, and the submission form (Text + File upload).
   - **Right Column**: Fragments Vault. Shows the 9 fragments collected so far.

3. **`/admin` (Admin Panel)**
   - Real-time queue of `pending` submissions.
   - Admins can view the submitted text and the Base64 proof image.
   - **Actions**: Approve (advances team, gives fragment, boosts score), Reject (gives 1 AI Strike), or Disqualify.

4. **`/leaderboard`**
   - Public-facing ranking page showing top teams sorted by level and score.

5. **`/results`**
   - Post-game summary page.

---

## 5. API Architecture (Next.js App Router)

- **`GET /api/dashboard`**: Fetches the authenticated team's current state, the live scoreboard (top active agents), and calculates time left.
- **`POST /api/dashboard/action`**: 
  - `action: "submit"`: Receives `answer` and `proofBase64`. Creates a `pending` submission.
  - `action: "hint"`: Unlocks a hint, applies a score penalty, and updates `global_hints_used`.
- **`GET /api/admin`**: Fetches all pending submissions, all teams, and system logs.
- **`POST /api/admin/action`**: Handles `approve`, `reject`, `disqualify`, `update_score`, and `broadcast` (system alerts).
- **`POST /api/auth`**: Sets HTTP-only cookies with JWTs or simple encrypted tokens to maintain session state.
- **`GET /api/seed`**: Wipes and resets the database with 10 test teams, dummy submissions, and level configurations.

---

## 6. Critical System Rules for AI Agents
If you are an AI reading this to implement future changes, **STRICTLY ADHERE TO THESE RULES**:
1. **Never use standard UI libraries** (like MUI, AntDesign, or basic Bootstrap) without heavy custom styling. The Cyberpunk aesthetic is non-negotiable.
2. **Image Handling**: We do NOT use Firebase Storage. Submissions convert images to a heavily compressed HTML `<canvas>` Base64 JPEG on the client side before sending to `/api/dashboard/action`.
3. **State Management**: Use `useState` and `useEffect` with `setInterval` polling (every 10s) to keep dashboards live without exhausting Firestore read quotas via WebSockets.
4. **Security**: API routes must verify the team's identity via cookies before executing actions. Admins have a separate auth token.
5. **No Destructive DB Changes**: Do not delete collections or modify the schema without explicit user approval.
