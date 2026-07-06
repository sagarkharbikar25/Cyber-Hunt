require("dotenv").config({ path: ".env" });
const { createClient } = require("@supabase/supabase-js");
const { Redis } = require("@upstash/redis");

const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;

async function runDiagnostics() {
  console.log(cyan("\n=================================================="));
  console.log(cyan("      CYBERHUNT SYSTEM DIAGNOSTIC CHECKS"));
  console.log(cyan("==================================================\n"));

  let errors = 0;
  let warnings = 0;

  // ─── 1. ENVIRONMENT CONFIGURATION CHECKS ───────────────────────────────────
  console.log(cyan("--- [1/3] Checking Environment Variables ---"));
  
  const requiredEnv = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "NEXTAUTH_SECRET"
  ];

  requiredEnv.forEach((key) => {
    if (!process.env[key]) {
      console.log(red(`❌ Missing required env variable: ${key}`));
      errors++;
    } else {
      console.log(green(`✅ Present: ${key} (${key === 'SUPABASE_SERVICE_ROLE_KEY' || key === 'UPSTASH_REDIS_REST_TOKEN' || key === 'NEXTAUTH_SECRET' ? 'Secret hidden' : process.env[key]})`));
    }
  });

  if (errors > 0) {
    console.log(red(`\nAbort checks: ${errors} critical environment variables are missing.`));
    process.exit(1);
  }

  // ─── 2. SUPABASE CONNECTION & SCHEMA INTEGRITY ────────────────────────────
  console.log(cyan("\n--- [2/3] Checking Supabase Connection & Schema Integrity ---"));
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // A. Check event config row
    const { data: config, error: configErr } = await supabase
      .from("event_settings")
      .select("*")
      .eq("id", "config")
      .single();

    if (configErr) {
      console.log(red(`❌ Table 'event_settings' check failed: ${configErr.message}`));
      errors++;
    } else {
      console.log(green("✅ Table 'event_settings' connection successful. config row loaded."));
      console.log(`   - Event active: ${config.is_active}`);
      console.log(`   - Results published: ${config.results_published}`);
    }

    // B. Check columns in teams table (specifically fields we recently updated)
    const { data: teamFields, error: teamErr } = await supabase
      .from("teams")
      .select("team_id, team_name, started_at, extra_minutes, level10_attempts")
      .limit(1);

    if (teamErr) {
      console.log(red(`❌ Table 'teams' structural integrity check failed: ${teamErr.message}`));
      errors++;
    } else {
      console.log(green("✅ Table 'teams' connection successful. Key fields validated."));
    }

    // C. Check levels table
    const { data: levels, error: levelErr } = await supabase
      .from("levels")
      .select("level_id, hint_1, hint_link");

    if (levelErr) {
      console.log(red(`❌ Table 'levels' check failed: ${levelErr.message}`));
      errors++;
    } else {
      console.log(green(`✅ Table 'levels' connection successful. Loaded ${levels.length} event levels.`));
      if (levels.length < 10) {
        console.log(yellow(`⚠️ Warning: Database has only ${levels.length}/10 levels seeded.`));
        warnings++;
      }
    }

    // D. Check submissions table
    const { data: submissions, error: subErr } = await supabase
      .from("submissions")
      .select("id, proof_url")
      .limit(1);

    if (subErr) {
      console.log(red(`❌ Table 'submissions' check failed: ${subErr.message}`));
      errors++;
    } else {
      console.log(green("✅ Table 'submissions' connection successful. Schema validated."));
    }

  } catch (supabaseException) {
    console.log(red(`❌ Critical Supabase connection crash: ${supabaseException.message}`));
    errors++;
  }

  // ─── 3. REDIS CONNECTION & WRITE PERMISSION CHECKS ──────────────────────
  console.log(cyan("\n--- [3/3] Checking Upstash Redis Operations ---"));

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  try {
    const testKey = `diagnostics:::test:::${Date.now()}`;
    
    // A. Perform Write test
    await redis.set(testKey, "success", { ex: 30 });
    console.log(green("✅ Redis Write test successful (set command parsed)."));

    // B. Perform Read test
    const readVal = await redis.get(testKey);
    if (readVal === "success") {
      console.log(green("✅ Redis Read test successful (get command parsed)."));
    } else {
      console.log(red("❌ Redis Read data mismatch."));
      errors++;
    }

    // C. Clean up test keys
    await redis.del(testKey);
    console.log(green("✅ Redis Delete test successful (del command parsed)."));

  } catch (redisError) {
    if (redisError.message.includes("NOPERM")) {
      console.log(red("❌ Redis connection failed: NOPERM error. Your REST token is generated with Read-Only permissions in the Upstash console. Please replace it with an admin (Read/Write) token."));
    } else {
      console.log(red(`❌ Redis connection failed: ${redisError.message}`));
    }
    errors++;
  }

  // ─── DIAGNOSTIC SUMMARY REPORT ─────────────────────────────────────────────
  console.log(cyan("\n=================================================="));
  console.log(cyan("                DIAGNOSTIC SUMMARY"));
  console.log(cyan("=================================================="));
  
  if (errors === 0) {
    console.log(green(`\nSTATUS: SUCCESSFUL. System is fully operational for Sunday's event!`));
    if (warnings > 0) {
      console.log(yellow(`Note: Found ${warnings} warnings. Review them above.`));
    }
    console.log(cyan("==================================================\n"));
    process.exit(0);
  } else {
    console.log(red(`\nSTATUS: FAILED. Found ${errors} critical errors. Fix them before deploying.`));
    console.log(cyan("==================================================\n"));
    process.exit(1);
  }
}

runDiagnostics();
