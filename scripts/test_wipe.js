require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testWipe() {
  const { error: err1 } = await supabase.from('submissions').delete().neq('id', 'dummy');
  if (err1) console.error("Submissions error:", err1);
  else console.log("Submissions wiped");
  
  const { error: err2 } = await supabase.from('activity_logs').delete().neq('id', 'dummy');
  if (err2) console.error("Logs error:", err2);
  else console.log("Logs wiped");
}
testWipe();
