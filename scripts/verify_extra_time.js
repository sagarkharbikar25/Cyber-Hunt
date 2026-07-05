require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyExtraTime() {
  const { data: teams, error } = await supabase
    .from('teams')
    .select('team_id, team_name, started_at')
    .not('started_at', 'is', null)
    .limit(5);

  if (error) {
    console.error("Error:", error);
    return;
  }

  const now = Date.now();
  console.log(`\nChecking ${teams.length} sample teams...\n`);

  teams.forEach(team => {
    const startedAt = new Date(team.started_at).getTime();
    const elapsedMs = now - startedAt;
    const elapsedMins = Math.floor(elapsedMs / 60000);
    const remainingMs = Math.max(0, (90 * 60 * 1000) - elapsedMs);
    const remainingMins = Math.floor(remainingMs / 60000);

    console.log(`Team: ${team.team_name} (${team.team_id})`);
    console.log(`  Started at: ${new Date(team.started_at).toLocaleTimeString()}`);
    console.log(`  Elapsed: ${elapsedMins} mins`);
    console.log(`  Time remaining: ${remainingMins} mins`);
    console.log('');
  });
}

verifyExtraTime();
