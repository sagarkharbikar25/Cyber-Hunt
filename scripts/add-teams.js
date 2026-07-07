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

  // Generate 40 additional test users dynamically
  for (let i = 1; i <= 40; i++) {
    const padId = i.toString().padStart(2, '0');
    teamsToInsert.push({
      team_id: `TEST-USER-${padId}`,
      team_name: `Test Squad ${padId}`,
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
    console.log("Successfully inserted/updated TA-CH-087, TA-CH-088, and TA-CH-089!");
  }
}

addTeams();
