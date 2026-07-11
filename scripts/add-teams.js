require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addTeams() {
  const teamsToInsert = [
    {
      team_id: 'TA-CH-087',
      team_name: 'Arhanta & Team',
      leader_email: 'lonarearhanta@gmail.com',
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    },
    {
      team_id: 'TA-CH-088',
      team_name: 'Parth & Team',
      leader_email: 'parthtembhare05@gmail.com',
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    },
    {
      team_id: 'TA-CH-089',
      team_name: 'MahaJan & Team',
      leader_email: 'mahajanmaheshwari08@gmail.com',
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    },
    {
      team_id: 'TEST-ALPHA',
      team_name: 'Test Squad Alpha',
      leader_email: 'test@example.com',
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    },
    {
      team_id: 'TEST-BETA',
      team_name: 'Test Squad Beta',
      leader_email: 'beta@example.com',
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    },
    {
      team_id: 'TEST-GAMMA',
      team_name: 'Test Squad Gamma',
      leader_email: 'gamma@example.com',
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    },
    {
      team_id: 'TEST-DELTA',
      team_name: 'Test Squad Delta',
      leader_email: 'delta@example.com',
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    },
    {
      team_id: 'TEST-EPSILON',
      team_name: 'Test Squad Epsilon',
      leader_email: 'epsilon@example.com',
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    },
    {
      team_id: 'TEST-ZETA',
      team_name: 'Test Squad Zeta',
      leader_email: 'zeta@example.com',
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    },
    {
      team_id: 'TEST-ETA',
      team_name: 'Test Squad Eta',
      leader_email: 'eta@example.com',
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    },
    {
      team_id: 'TEST-THETA',
      team_name: 'Test Squad Theta',
      leader_email: 'theta@example.com',
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    },
    {
      team_id: 'TEST-IOTA',
      team_name: 'Test Squad Iota',
      leader_email: 'iota@example.com',
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    },
    {
      team_id: 'TEST-KAPPA',
      team_name: 'Test Squad Kappa',
      leader_email: 'kappa@example.com',
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    }
  ];

  console.log("Cleaning up old test users (TEST-USER-)...");
  const { error: deleteError } = await supabase
    .from('teams')
    .delete()
    .like('team_id', 'TEST-USER-%');

  if (deleteError) {
    console.error("Failed to delete old test users:", deleteError);
  } else {
    console.log("Cleaned up old test users successfully.");
  }

  // Generate 40 additional test users dynamically starting from 40 to 79
  for (let i = 40; i <= 79; i++) {
    teamsToInsert.push({
      team_id: `TEST-USER-${i}`,
      team_name: `Test Squad ${i}`,
      leader_email: `testuser${i}@example.com`,
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    });
  }

  console.log("Inserting/Updating new teams...");
  const { error } = await supabase.from('teams').upsert(teamsToInsert);
  
  if (error) {
    console.error("Failed to insert/update teams:", error);
  } else {
    console.log("Successfully inserted/updated all configured teams and test users!");
  }
}

addTeams();
