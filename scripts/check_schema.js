require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  const { data, error } = await supabase.from('teams').select('*').limit(1).single();
  if (error) console.error(error);
  else console.log("TEAM KEYS:", Object.keys(data));
}
checkSchema();
