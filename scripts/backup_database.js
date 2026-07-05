require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function backupDatabase() {
  console.log("📦 Starting full database backup...\n");

  const backup = {
    exportedAt: new Date().toISOString(),
    tables: {}
  };

  // 1. Backup Teams
  console.log("🔄 Fetching teams...");
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*');
  if (teamsError) {
    console.error("❌ Error fetching teams:", teamsError.message);
  } else {
    backup.tables.teams = teams;
    console.log(`✅ Teams: ${teams.length} records`);
  }

  // 2. Backup Submissions
  console.log("🔄 Fetching submissions...");
  const { data: submissions, error: subsError } = await supabase
    .from('submissions')
    .select('*')
    .order('timestamp', { ascending: false });
  if (subsError) {
    console.error("❌ Error fetching submissions:", subsError.message);
  } else {
    backup.tables.submissions = submissions;
    console.log(`✅ Submissions: ${submissions.length} records`);
  }

  // 3. Save to file
  const fileName = `cyberhunt_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filePath = path.join(__dirname, '..', fileName);
  
  fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));
  
  console.log(`\n🎉 Backup complete!`);
  console.log(`📁 Saved to: ${filePath}`);
  console.log(`   - ${backup.tables.teams?.length || 0} teams`);
  console.log(`   - ${backup.tables.submissions?.length || 0} submissions`);

  // 4. Also generate a simple CSV of results for easy viewing
  if (teams && teams.length > 0) {
    const csvLines = ['Team ID,Team Name,Score,Current Level,Is Disqualified,AI Strikes,Hints Used,Started At'];
    teams
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .forEach(t => {
        csvLines.push([
          t.team_id,
          `"${t.team_name}"`,
          t.score || 0,
          t.current_level || 1,
          t.is_disqualified ? 'YES' : 'NO',
          t.ai_strikes || 0,
          t.global_hints_used || 0,
          t.started_at ? new Date(t.started_at).toLocaleString() : 'Not started'
        ].join(','));
      });

    const csvFileName = `cyberhunt_results_${new Date().toISOString().slice(0,10)}.csv`;
    const csvPath = path.join(__dirname, '..', csvFileName);
    fs.writeFileSync(csvPath, csvLines.join('\n'));
    console.log(`\n📊 Results CSV saved to: ${csvPath}`);
    console.log('   (Open this in Excel to see the final leaderboard!)')
  }
}

backupDatabase();
