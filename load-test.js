/**
 * load-test.js — CyberHunt CTF load test (k6)
 *
 * Install k6: https://k6.io/docs/getting-started/installation/
 * (Windows: choco install k6 / winget install k6)
 *
 * Usage:
 *   k6 run load-test.js                          # default: 50 VUs
 *   k6 run --env VUS=200 load-test.js            # 200 concurrent users
 *   k6 run --env BASE_URL=https://your.app load-test.js
 *
 * What it simulates (realistic CTF traffic pattern):
 *   Phase 1 — Login burst (first 60 s): all VUs log in simultaneously
 *   Phase 2 — Sustained play (60–600 s): mix of leaderboard polls + submissions
 *   Phase 3 — Cooldown (600–660 s): ramp down
 *
 * What to watch during the run:
 *   - http_req_failed: should stay < 1%
 *   - http_req_duration (p95): should stay < 1000 ms
 *   - http_req_duration (p99): should stay < 3000 ms
 *   - Supabase dashboard → Database → Connections: should stay well below limit
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

// ─── Configuration ────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const VUS      = parseInt(__ENV.VUS || "50");   // concurrent virtual users

// Test teams — add your real test team IDs here (must exist in DB)
// Format: [email, team_id]
const TEST_TEAMS = [
  ["test@example.com",    "TEST-ALPHA"],
  ["beta@example.com",    "TEST-BETA"],
  ["gamma@example.com",   "TEST-GAMMA"],
  ["delta@example.com",   "TEST-DELTA"],
  ["epsilon@example.com", "TEST-EPSILON"],
  ["zeta@example.com",    "TEST-ZETA"],
  ["eta@example.com",     "TEST-ETA"],
  ["theta@example.com",   "TEST-THETA"],
  ["iota@example.com",    "TEST-IOTA"],
  ["kappa@example.com",   "TEST-KAPPA"],
];

// ─── Custom metrics ───────────────────────────────────────────────────────────
const loginDuration     = new Trend("login_duration_ms");
const dashboardDuration = new Trend("dashboard_duration_ms");
const leaderDuration    = new Trend("leaderboard_duration_ms");
const rateLimitRate     = new Rate("rate_limited_requests");

// ─── k6 scenario config ───────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: "30s", target: VUS },      // Ramp up — simulates everyone arriving
    { duration: "60s", target: VUS },      // Login burst — all VUs logging in
    { duration: "480s", target: VUS },     // Sustained play — flag submissions + leaderboard polling
    { duration: "30s", target: 0 },        // Ramp down
  ],
  thresholds: {
    http_req_failed:              ["rate<0.05"],   // < 5% failure rate
    http_req_duration:            ["p(95)<1500"],  // 95% of requests under 1.5 s
    login_duration_ms:            ["p(95)<2000"],
    dashboard_duration_ms:        ["p(95)<1000"],
    leaderboard_duration_ms:      ["p(95)<500"],   // leaderboard is cached — should be fast
  },
};

// ─── Main scenario ────────────────────────────────────────────────────────────
export default function () {
  // Each VU picks a team from the pool (round-robin)
  const teamIdx  = __VU % TEST_TEAMS.length;
  const [email, teamId] = TEST_TEAMS[teamIdx];

  const jar = http.cookieJar();

  // ── 1. Login ────────────────────────────────────────────────────────────
  const loginStart = Date.now();
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, team_id: teamId }),
    { headers: { "Content-Type": "application/json" }, jar }
  );
  loginDuration.add(Date.now() - loginStart);

  const loginOk = check(loginRes, {
    "login 200":            (r) => r.status === 200,
    "login has team_name":  (r) => r.json("team_name") !== undefined,
  });

  // Track 429s separately so you can see if rate limits are too tight
  rateLimitRate.add(loginRes.status === 429 ? 1 : 0);

  if (!loginOk) {
    // If login failed (DB overloaded or rate-limited), wait and don't hammer further
    sleep(5);
    return;
  }

  sleep(1 + Math.random() * 2); // humans take 1–3 s after login

  // ── 2. Load dashboard ────────────────────────────────────────────────────
  const dashStart = Date.now();
  const dashRes = http.get(`${BASE_URL}/api/dashboard`, { jar });
  dashboardDuration.add(Date.now() - dashStart);

  check(dashRes, {
    "dashboard 200":       (r) => r.status === 200,
    "dashboard has team":  (r) => r.json("team") !== undefined,
  });

  sleep(2 + Math.random() * 3); // read the mission

  // ── 3. Simulate play loop (leaderboard polls + occasional submission) ────
  for (let i = 0; i < 5; i++) {
    // Leaderboard poll — happens every ~30 s in the real frontend
    const lbStart = Date.now();
    const lbRes = http.get(`${BASE_URL}/api/leaderboard`);
    leaderDuration.add(Date.now() - lbStart);

    check(lbRes, {
      "leaderboard 200":   (r) => r.status === 200,
      "leaderboard array": (r) => Array.isArray(r.json("leaderboard")),
    });

    rateLimitRate.add(lbRes.status === 429 ? 1 : 0);

    // ~20% chance of submitting a flag (realistic: most users are still thinking)
    if (Math.random() < 0.2) {
      const submitData = new FormData();
      submitData.append("action", "submit");
      submitData.append("answer", "X"); // dummy answer — will be wrong but tests the path
      submitData.append("proofBase64", "data:image/jpeg;base64,/9j/4AAQ"); // tiny stub
      submitData.append("level_id", "1");

      const subRes = http.post(`${BASE_URL}/api/dashboard/action`, submitData, { jar });
      rateLimitRate.add(subRes.status === 429 ? 1 : 0);

      check(subRes, {
        "submit not 500": (r) => r.status !== 500,
      });
    }

    sleep(25 + Math.random() * 10); // wait 25–35 s between leaderboard polls
  }
}
