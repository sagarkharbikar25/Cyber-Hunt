require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTeams() {
  const { data: teams, error } = await supabase.from('teams').select('team_id, fragments').limit(10);
  console.log("Error:", error);
  console.log("Teams fragments:", JSON.stringify(teams, null, 2));
}
checkTeams();
