export interface Team {
  team_id: string;
  team_name: string;
  leader_name: string;
  leader_email: string;
  member_count: number;
  members_json: { name: string; email: string }[];
  registered_at: string;
  started_at?: string;
  level10_started_at?: string;
  level_hints?: Record<string, number>;
  is_disqualified: boolean;
  score?: number;
  global_hints_used?: number;
  fragments?: string[];
}

export interface Level {
  level_id: number;
  title: string;
  challenge_type: string;
  content_html: string;
  answer_hash: string;
  answer_salt: string;
  fragment: string;
  hint_1: string;
  hint_2: string;
  hint_3: string;
  is_active: boolean;
}

export interface Progress {
  team_id: string;
  level_id: number;
  started_at: string;
  solved_at: string | null;
  attempts: number;
  hints_used: number[];
}

export interface Submission {
  id: string;
  team_id: string;
  level_id: number;
  is_correct: boolean;
  submitted_at: string;
  ip_address: string;
}

export interface EventSettings {
  id: number;
  event_start: string;
  event_end: string;
  is_paused: boolean;
  paused_at: string | null;
  total_paused_ms: number;
  registration_open: boolean;
  results_published: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  role: "superadmin" | "monitor";
  last_login: string | null;
}

export interface FinalSubmission {
  submission_id: string;
  team_id: string;
  level10_solved_at: string;
  screenshot_url: string | null;
  screenshot_uploaded_at: string | null;
  status: "pending" | "verified" | "disqualified";
  is_winner: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  team_name: string;
  team_id: string;
  levels_solved: number;
  score: number;
  finished_at: string | null;
}

export interface Hint {
  num: number;
  text: string;
  unlock_minute: number;
}

export interface Fragment {
  level_id: number;
  value: string;
}

export interface DashboardData {
  team_name: string;
  team_id: string;
  rank: number;
  current_level: number;
  levels_solved: number;
  total_hints_used: number;
  score: number;
  fragments: Fragment[];
  event_status: "not_started" | "active" | "paused" | "ended";
  time_remaining_s: number;
  total_paused_ms: number;
}

export interface LevelResponse {
  title: string;
  content_html: string;
  challenge_type: string;
  level_id: number;
}

export interface AuthPayload {
  team_id: string;
  leader_email: string;
  iat: number;
  exp: number;
}

export type EventPhase = "not_started" | "active" | "paused" | "ended";
