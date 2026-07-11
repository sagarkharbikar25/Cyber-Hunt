require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function importTeams() {
  console.log("Reading Excel file...");
  const fs = require('fs');
  const fileWithSpace = 'resources/Cyber Hunt.xlsx';
  const fileWithUnderscore = 'resources/Cyber_Hunt.xlsx';
  let filePath = '';
  if (fs.existsSync(fileWithSpace)) {
    filePath = fileWithSpace;
  } else if (fs.existsSync(fileWithUnderscore)) {
    filePath = fileWithUnderscore;
  } else {
    console.error("Excel file not found at:", fileWithSpace, "or", fileWithUnderscore);
    return;
  }
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
  console.log(`Found ${data.length} rows in Excel.`);

  console.log("Fetching existing teams from database...");
  const { data: existingTeams, error } = await supabase.from('teams').select('team_id');
  if (error) {
    console.error("Error fetching teams:", error);
    return;
  }

  const existingIds = new Set(existingTeams.map(t => t.team_id));
  console.log(`Found ${existingIds.size} teams already in the database.`);

  const newTeamsToInsert = [];

  for (const row of data) {
    const teamId = row['Team-Code']?.trim();
    if (!teamId) continue; // Skip rows without a team code

    if (!existingIds.has(teamId)) {
      const leaderName = (row['Team Leader'] || '').trim();
      const leaderEmail = (row['Email Address  '] || '').trim();

      newTeamsToInsert.push({
        team_id: teamId,
        team_name: leaderName || `Team ${teamId}`, // Use leader name as team name
        leader_email: leaderEmail,
        fragments: ["", "", "", "", "", "", "", "", ""],
        score: 0,
        current_level: 1,
        ai_strikes: 0,
        global_hints_used: 0,
        level_hints: {},
        is_disqualified: false
      });
    }
  }

  console.log(`Identified ${newTeamsToInsert.length} new teams to insert.`);

  if (newTeamsToInsert.length > 0) {
    const { error: insertError } = await supabase.from('teams').insert(newTeamsToInsert);
    if (insertError) {
      console.error("Error inserting teams:", insertError);
      return;
    }
    console.log("Successfully inserted remaining teams!");
  } else {
    console.log("No new teams to insert.");
  }
}

importTeams();
