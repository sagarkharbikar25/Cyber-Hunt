// Run this ONCE to:
// 1. Add extra_minutes column to teams table (if not exists)
// 2. Grant 40 extra minutes to ALL teams immediately
//
// Usage: node scripts/grant_extra_time.js

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const EXTRA_MINUTES = 40;

async function grantExtraTime() {
  console.log(`\n⏱️  Granting +${EXTRA_MINUTES} minutes to all teams...\n`);

  // Fetch all teams
  const { data: teams, error: fetchError } = await supabase
    .from('teams')
    .select('team_id, team_name, extra_minutes');

  if (fetchError) {
    console.error('❌ Error fetching teams:', fetchError.message);
    process.exit(1);
  }

  console.log(`📋 Found ${teams.length} teams\n`);

  let successCount = 0;
  let failCount = 0;

  for (const team of teams) {
    const current = team.extra_minutes || 0;
    const newExtra = current + EXTRA_MINUTES;

    const { error: updateError } = await supabase
      .from('teams')
      .update({ extra_minutes: newExtra })
      .eq('team_id', team.team_id);

    if (updateError) {
      console.error(`  ❌ Failed for ${team.team_name}:`, updateError.message);
      failCount++;
    } else {
      console.log(`  ✅ ${team.team_name}: ${current} → ${newExtra} min`);
      successCount++;
    }
  }

  // Log to activity feed
  await supabase.from('activity_logs').insert({
    message: `⏱️ Mission Control granted +${EXTRA_MINUTES} min extra time to all ${successCount} teams due to downtime.`
  });

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Done! ${successCount} teams updated, ${failCount} failed.`);
  console.log(`Teams now have ${90 + EXTRA_MINUTES} minutes total (90 + ${EXTRA_MINUTES} extra)`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

grantExtraTime().catch(console.error);
