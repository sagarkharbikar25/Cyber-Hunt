require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testUpdate() {
  const { data: team, error } = await supabase.from('teams').select('team_id').limit(1).single();
  if (error) return console.error(error);
  
  console.log("Found team:", team.team_id);
  const now = new Date().toISOString();
  
  const { error: updateError } = await supabase.from('teams').update({ started_at: now }).eq('team_id', team.team_id);
  
  if (updateError) {
    console.error("Update failed:", updateError);
  } else {
    console.log("Update succeeded!");
  }
}
testUpdate();
