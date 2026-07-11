require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const testUserIds = [
  'TEST-ALPHA', 'TEST-BETA', 'TEST-GAMMA', 'TEST-DELTA', 'TEST-EPSILON',
  'TEST-ZETA', 'TEST-ETA', 'TEST-THETA', 'TEST-IOTA', 'TEST-KAPPA'
];

async function importTeams() {
  console.log("Reading Excel file...");
  const fileSlot2 = 'Slot-2.xlsx';
  const fileWithSpace = 'resources/Cyber Hunt.xlsx';
  const fileWithUnderscore = 'resources/Cyber_Hunt.xlsx';
  let filePath = '';
  if (fs.existsSync(fileSlot2)) {
    filePath = fileSlot2;
  } else if (fs.existsSync(fileWithSpace)) {
    filePath = fileWithSpace;
  } else if (fs.existsSync(fileWithUnderscore)) {
    filePath = fileWithUnderscore;
  } else {
    console.error("Excel file not found at:", fileSlot2, "or resources folder.");
    return;
  }

  const workbook = xlsx.readFile(filePath);
  
  // Find "Slot 2" sheet
  const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes("slot 2") || n === "Slot 2") || workbook.SheetNames[0];
  console.log(`Using sheet: ${sheetName}`);
  
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  console.log(`Found ${data.length} rows in "${sheetName}".`);

  // Parse Excel teams
  const slot2Teams = [];
  const slot2TeamIds = new Set();
  
  for (const row of data) {
    const teamId = row['Team-Code']?.toString().trim();
    if (!teamId) continue;

    const leaderName = (row['Team Leader'] || '').toString().trim();
    const leaderEmail = (row['Email Address  '] || '').toString().trim();

    slot2Teams.push({
      team_id: teamId,
      team_name: leaderName || `Team ${teamId}`,
      leader_email: leaderEmail,
      fragments: ["", "", "", "", "", "", "", "", ""],
      score: 0,
      current_level: 1,
      ai_strikes: 0,
      global_hints_used: 0,
      level_hints: {},
      is_disqualified: false
    });
    slot2TeamIds.add(teamId);
  }

  console.log(`Parsed ${slot2Teams.length} teams from Excel.`);

  // 1. Fetch all current teams from database
  console.log("Fetching existing teams from database...");
  const { data: dbTeams, error: fetchError } = await supabase.from('teams').select('team_id');
  if (fetchError) {
    console.error("Error fetching teams:", fetchError);
    return;
  }

  // 2. Identify teams to delete (not in Slot 2 and not in 10 test users)
  const teamsToDelete = dbTeams
    .map(t => t.team_id)
    .filter(id => !testUserIds.includes(id) && !slot2TeamIds.has(id));

  if (teamsToDelete.length > 0) {
    console.log(`Deleting ${teamsToDelete.length} old teams not in Slot 2 or the 10 test users...`);
    const { error: deleteError } = await supabase.from('teams').delete().in('team_id', teamsToDelete);
    if (deleteError) {
      console.error("Error deleting teams:", deleteError);
      return;
    }
    console.log("Old teams deleted successfully.");
  } else {
    console.log("No old teams to delete.");
  }

  // 3. Upsert Slot 2 teams
  if (slot2Teams.length > 0) {
    console.log(`Upserting ${slot2Teams.length} Slot 2 teams...`);
    const { error: insertError } = await supabase.from('teams').upsert(slot2Teams);
    if (insertError) {
      console.error("Error inserting Slot 2 teams:", insertError);
      return;
    }
    console.log("Successfully upserted Slot 2 teams!");
  }

  // 4. Upsert 10 backup test users
  const backupUsers = [
    { email: "test@example.com", id: "TEST-ALPHA", name: "Test Squad Alpha" },
    { email: "beta@example.com", id: "TEST-BETA", name: "Test Squad Beta" },
    { email: "gamma@example.com", id: "TEST-GAMMA", name: "Test Squad Gamma" },
    { email: "delta@example.com", id: "TEST-DELTA", name: "Test Squad Delta" },
    { email: "epsilon@example.com", id: "TEST-EPSILON", name: "Test Squad Epsilon" },
    { email: "zeta@example.com", id: "TEST-ZETA", name: "Test Squad Zeta" },
    { email: "eta@example.com", id: "TEST-ETA", name: "Test Squad Eta" },
    { email: "theta@example.com", id: "TEST-THETA", name: "Test Squad Theta" },
    { email: "iota@example.com", id: "TEST-IOTA", name: "Test Squad Iota" },
    { email: "kappa@example.com", id: "TEST-KAPPA", name: "Test Squad Kappa" }
  ].map(u => ({
    team_id: u.id,
    team_name: u.name,
    leader_email: u.email,
    fragments: ["", "", "", "", "", "", "", "", ""],
    score: 0,
    current_level: 1,
    ai_strikes: 0,
    global_hints_used: 0,
    level_hints: {},
    is_disqualified: false
  }));

  console.log("Upserting 10 backup test users...");
  const { error: backupError } = await supabase.from('teams').upsert(backupUsers);
  if (backupError) {
    console.error("Error upserting backup test users:", backupError);
  } else {
    console.log("Successfully upserted 10 backup test users!");
  }
}

importTeams();
