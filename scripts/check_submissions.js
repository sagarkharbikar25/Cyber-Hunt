require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubmissions() {
  const { count, error } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error("Error fetching submissions:", error);
  } else {
    console.log(`Total submissions in database: ${count}`);
  }
}

checkSubmissions();
