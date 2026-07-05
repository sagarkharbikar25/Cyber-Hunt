require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function injectTestSubmission() {
  console.log("Injecting a test submission...");
  
  const { error } = await supabase.from('submissions').insert([
    {
      team_id: 'TA-CH-001',
      team_name: 'Test Team Alpha',
      level_id: 1,
      answer: 'test_answer',
      proof_url: 'https://example.com/test.png',
      status: 'pending'
    }
  ]);
  
  if (error) {
    console.error("Failed to inject test submission:", error);
  } else {
    console.log("Successfully injected test submission! Tell the user to check their admin dashboard now.");
  }
}

injectTestSubmission();
