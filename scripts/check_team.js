require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTeam() {
  const { data: team, error } = await supabase.from('teams').select('started_at').eq('team_id', 'TEST-EPSILON').single();
  console.log("TEST-EPSILON started_at in DB:", team.started_at);
}
checkTeam();
