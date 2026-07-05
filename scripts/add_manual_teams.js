require('dotenv').config({ path: '.env.local' });
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
    }

  ];

  console.log("Inserting new teams...");
  const { error } = await supabase.from('teams').insert(teamsToInsert);

  if (error) {
    console.error("Failed to insert teams:", error);
  } else {
    console.log("Successfully inserted TA-CH-087 and TA-CH-088!");
  }
}

addTeams();
