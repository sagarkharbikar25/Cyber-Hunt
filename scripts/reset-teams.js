require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetTeams() {
  console.log("Fetching all teams...");
  const { data: teams, error: fetchError } = await supabase.from('teams').select('team_id');
  
  if (fetchError) {
    console.error("Error fetching teams:", fetchError);
    return;
  }

  console.log(`Found ${teams.length} teams. Resetting progress...`);
  
  let resetCount = 0;
  for (const team of teams) {
    const { error: updateError } = await supabase
      .from('teams')
      .update({
        fragments: ["", "", "", "", "", "", "", "", ""],
        score: 0,
        current_level: 1,
        ai_strikes: 0,
        global_hints_used: 0,
        level_hints: {},
        is_disqualified: false,
        started_at: null, // Resets their 90-minute timer
        level10_attempts: 0,
        level10_started_at: null,
        last_submission_at: null
      })
      .eq('team_id', team.team_id);

    if (updateError) {
      console.error(`Failed to reset ${team.team_id}:`, updateError.message);
    } else {
      resetCount++;
    }
  }

  console.log(`Successfully reset ${resetCount} teams back to a fresh state!`);

  console.log("Wiping all submissions and activity logs...");
  await supabase.from('submissions').delete().neq('team_id', 'dummy_team');
  await supabase.from('activity_logs').delete().neq('team_id', 'dummy_team');
  console.log("Database is completely clean!");
}

resetTeams();
