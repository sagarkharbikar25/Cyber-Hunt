-- =============================================
-- CyberHunt Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
  team_id VARCHAR(12) PRIMARY KEY,
  team_name VARCHAR(100) NOT NULL,
  leader_name VARCHAR(100) NOT NULL,
  leader_email VARCHAR(255) NOT NULL UNIQUE,
  college_name VARCHAR(200) NOT NULL,
  member_count SMALLINT NOT NULL CHECK (member_count BETWEEN 1 AND 2),
  members_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_strikes SMALLINT NOT NULL DEFAULT 0,
  global_hints_used SMALLINT NOT NULL DEFAULT 0,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_disqualified BOOLEAN NOT NULL DEFAULT false
);

-- LEVELS TABLE
CREATE TABLE IF NOT EXISTS levels (
  level_id SMALLINT PRIMARY KEY CHECK (level_id BETWEEN 1 AND 10),
  title VARCHAR(200) NOT NULL,
  challenge_type VARCHAR(50) NOT NULL,
  content_html TEXT NOT NULL,
  answer_hash VARCHAR(64) NOT NULL,
  answer_salt VARCHAR(32) NOT NULL,
  fragment VARCHAR(10) NOT NULL,
  hint_1 TEXT NOT NULL,
  hint_2 TEXT NOT NULL,
  hint_3 TEXT NOT NULL,
  success_message_html TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- PROGRESS TABLE
CREATE TABLE IF NOT EXISTS progress (
  team_id VARCHAR(12) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
  level_id SMALLINT NOT NULL CHECK (level_id BETWEEN 1 AND 10),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  solved_at TIMESTAMPTZ,
  attempts INT NOT NULL DEFAULT 0,
  hints_used INT[] NOT NULL DEFAULT '{}',
  PRIMARY KEY (team_id, level_id)
);

-- SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id VARCHAR(12) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
  level_id SMALLINT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  proof_image_url TEXT,
  ai_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (ai_status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET
);

-- EVENT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS event_settings (
  id INT PRIMARY KEY CHECK (id = 1),
  event_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '90 minutes'),
  is_paused BOOLEAN NOT NULL DEFAULT false,
  paused_at TIMESTAMPTZ,
  total_paused_ms BIGINT NOT NULL DEFAULT 0,
  registration_open BOOLEAN NOT NULL DEFAULT true,
  results_published BOOLEAN NOT NULL DEFAULT false
);

-- ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'monitor' CHECK (role IN ('superadmin', 'monitor')),
  last_login TIMESTAMPTZ
);

-- FINAL SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS final_submissions (
  submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id VARCHAR(12) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE UNIQUE,
  level10_solved_at TIMESTAMPTZ,
  screenshot_url TEXT,
  screenshot_uploaded_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'disqualified')),
  is_winner BOOLEAN NOT NULL DEFAULT false
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_progress_team ON progress(team_id);
CREATE INDEX IF NOT EXISTS idx_progress_level ON progress(level_id);
CREATE INDEX IF NOT EXISTS idx_submissions_team ON submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_submissions_level ON submissions(level_id);
CREATE INDEX IF NOT EXISTS idx_submissions_ip ON submissions(ip_address);
CREATE INDEX IF NOT EXISTS idx_teams_email ON teams(leader_email);

-- INSERT DEFAULT EVENT SETTINGS
INSERT INTO event_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Teams: public read for leaderboard, insert for registration
CREATE POLICY "teams_insert_registration" ON teams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "teams_select_public" ON teams
  FOR SELECT USING (true);

CREATE POLICY "teams_update_own" ON teams
  FOR UPDATE USING (true);

-- Levels: public read only (content visible, answer_hash hidden via API)
CREATE POLICY "levels_select_public" ON levels
  FOR SELECT USING (true);

CREATE POLICY "levels_update_admin" ON levels
  FOR UPDATE USING (true);

CREATE POLICY "levels_insert_admin" ON levels
  FOR INSERT WITH CHECK (true);

-- Progress: authenticated via service role
CREATE POLICY "progress_all_service" ON progress
  FOR ALL USING (true);

-- Submissions: authenticated via service role
CREATE POLICY "submissions_all_service" ON submissions
  FOR ALL USING (true);

-- Event settings: authenticated via service role
CREATE POLICY "event_settings_all_service" ON event_settings
  FOR ALL USING (true);

-- Final submissions: authenticated via service role
CREATE POLICY "final_submissions_all_service" ON final_submissions
  FOR ALL USING (true);

-- Admin users: service role only
CREATE POLICY "admin_users_all_service" ON admin_users
  FOR ALL USING (true);
