require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDBSize() {
  console.log("Checking database table sizes...\n");

  // Check row counts of each table
  const tables = ['teams', 'submissions', 'activity_logs', 'levels'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`${table}: ERROR - ${error.message}`);
      } else {
        console.log(`${table}: ${count} rows`);
      }
    } catch (e) {
      console.log(`${table}: table may not exist`);
    }
  }
}

checkDBSize();
