require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addExtraTime(extraMinutes) {
  console.log(`Adding ${extraMinutes} minutes to every team's timer...`);
  
  // 1. Fetch all teams that have started
  const { data: teams, error: fetchError } = await supabase
    .from('teams')
    .select('team_id, started_at')
    .not('started_at', 'is', null);

  if (fetchError) {
    console.error("Error fetching teams:", fetchError);
    return;
  }

  // 2. Update each team's started_at to be X minutes LATER (which gives them more time)
  for (const team of teams) {
    const currentStart = new Date(team.started_at).getTime();
    const newStart = new Date(currentStart + (extraMinutes * 60 * 1000));
    
    await supabase
      .from('teams')
      .update({ started_at: newStart.toISOString() })
      .eq('team_id', team.team_id);
  }
  
  console.log(`Successfully gave ${teams.length} teams an extra ${extraMinutes} minutes!`);
}

// Add 25 extra minutes (to make a total of 40 combined with the first run).
addExtraTime(25);
