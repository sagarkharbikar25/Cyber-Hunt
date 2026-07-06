# CYBERHUNT: System Architecture & Implementation Guide

This document serves as the comprehensive source of truth for the **CyberHunt (Operation Vault / Operation Blackout)** platform.

---

## 1. Tech Stack Overview
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS (v4) + Vanilla CSS (CSS Variables for dynamic cyberpunk styling)
- **Database**: PostgreSQL via Supabase (SDK: `@supabase/supabase-js`)
- **Caching & Rate Limiting**: Upstash Redis (`@upstash/redis` + `@upstash/ratelimit`)
- **Hosting**: Vercel (Edge-compatible functions)

---

## 2. Design Philosophy: The "Cyber Cockpit"
The entire application follows a strict "Cyberpunk Hacker" aesthetic. 
- **Colors**: Neon Green (`#00ff88`), Warning Amber (`#ffaa00`), Critical Red (`#ff3333`), Dark Backgrounds (`#0a0f14`).
- **Typography**: `Orbitron` (Headers/Logos), `Share Tech Mono` (Data/Numbers), `Rajdhani` (Body text).
- **Animations**: Blinking, pulse, and scanline effects are heavily utilized to create an immersive environment.

---

## 3. Database Schema (Supabase PostgreSQL)

### `teams` (Table)
Represents a participating squad.
- `team_id` (text, PK): Unique identifier (e.g., "TEST-ALPHA").
- `team_name` (text): Display name.
- `leader_email` (text): Contact email for the team leader.
- `score` (integer): Current score (increases with levels, decreases with hints).
- `current_level` (integer): The level they are currently on (1 to 10).
- `fragments` (text[]): 9 slots representing the pieces of the final flag.
- `ai_strikes` (integer): Strikes recorded (3 strikes = Disqualification).
- `global_hints_used` (integer): Count of hints decrypted.
- `level_hints` (jsonb): Key-value pairs tracking hints used per level (e.g., `{"1": 1}`).
- `is_disqualified` (boolean): If true, locks team out of the dashboard.
- `started_at` (timestamptz): When the team first logged in (for the 90-minute countdown).
- `last_submission_at` (timestamptz): Timestamp of last submission (tie-breaker).
- `level10_started_at` (timestamptz): When level 10 was unlocked.
- `level10_attempts` (integer): Count of final level submissions (max 2).
- `extra_minutes` (integer): Extra minutes granted by admin.

### `submissions` (Table)
Track team flag solution submissions.
- `id` (uuid, PK): Auto-generated.
- `team_id` (text, FK): References `teams(team_id)`.
- `team_name` (text): Copy of team name.
- `level_id` (integer): Level number.
- `answer` (text): Decrypted flag value submitted.
- `proof_url` (text): Base64 JPEG string of the submission screenshot.
- `status` (text): `'pending' | 'approved' | 'rejected' | 'approved_ai' | 'rejected_ai'`.
- `timestamp` (timestamptz): Submission time.

### `activity_logs` (Table)
Used to populate the live dashboard feed.
- `id` (uuid, PK): Auto-generated.
- `message` (text): Log message content.
- `timestamp` (timestamptz): Log creation time.

### `event_settings` (Table)
Global controls.
- `id` (text, PK): `'config'`.
- `is_active` (boolean).
- `start_time` (timestamptz).
- `results_published` (boolean).

---

## 4. Application Routes

1. **`/` (Login)**: Onboarding gate. Email and Team ID required.
2. **`/dashboard` (Mission Control)**: Core interface containing timer, live agent scoreboard, mission briefing, active hints, base64 proof uploader, and active fragments grid.
3. **`/admin/login` & `/admin/submissions`**: Security gateway and admin control dashboard to approve/reject submissions, flag AI submissions, reset teams, download reports, or grant extra time.
4. **`/leaderboard`**: Public live standings (cached on Redis).
5. **`/results`**: Winner ceremony page (published after event verification).

---

## 5. API Architecture

- **`POST /api/auth/login`**: Sign JWT tokens for teams (cookie `cyberhunt_token`).
- **`POST /api/admin/auth`**: Sign signed JWT with admin role claim (cookie `cyberhunt_admin_token`).
- **`GET /api/dashboard`**: Read team stats (from Supabase) and merge with live feed & active agent standby lists (served from Upstash Redis cache).
- **`POST /api/dashboard/action`**: Handles submissions & hint unlocking (rate-limited by team_id).
- **`POST /api/admin/extra-time`**: Grant extra time to teams (admin authenticated).
- **`GET /api/leaderboard`**: Public scoreboard cached on Redis.