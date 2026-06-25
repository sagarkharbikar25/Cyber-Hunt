import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { HINT_UNLOCK_INTERVAL_MINUTES, MAX_GLOBAL_HINTS } from "@/lib/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ levelId: string }> }
) {
  try {
    const user = await requireAuth();
    const { levelId: levelIdStr } = await params;
    const levelId = parseInt(levelIdStr, 10);

    if (isNaN(levelId) || levelId < 1 || levelId > 10) {
      return NextResponse.json({ error: "Invalid level ID" }, { status: 400 });
    }

    const { data: level, error: levelError } = await supabaseAdmin
      .from("levels")
      .select("hint_1, hint_2, hint_3")
      .eq("level_id", levelId)
      .single();

    if (levelError || !level) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    const { data: progress } = await supabaseAdmin
      .from("progress")
      .select("hints_used, solved_at")
      .eq("team_id", user.team_id)
      .eq("level_id", levelId)
      .single();

    if (!progress) {
      return NextResponse.json({ error: "You haven't started this level yet" }, { status: 403 });
    }

    const hintsUsed = progress.hints_used || [];
    const availableHints = [];
    
    if (hintsUsed.includes(1)) availableHints.push({ num: 1, text: level.hint_1 });
    if (hintsUsed.includes(2)) availableHints.push({ num: 2, text: level.hint_2 });
    if (hintsUsed.includes(3)) availableHints.push({ num: 3, text: level.hint_3 });

    return NextResponse.json({
      available_hints: availableHints,
      hints_used: hintsUsed,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Hints error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ levelId: string }> }
) {
  try {
    const user = await requireAuth();
    const { levelId: levelIdStr } = await params;
    const levelId = parseInt(levelIdStr, 10);

    if (isNaN(levelId) || levelId < 1 || levelId > 10) {
      return NextResponse.json({ error: "Invalid level ID" }, { status: 400 });
    }

    // 1. Fetch team, progress, event settings, and level
    const [teamRes, progressRes, settingsRes, levelRes] = await Promise.all([
      supabaseAdmin.from("teams").select("global_hints_used").eq("team_id", user.team_id).single(),
      supabaseAdmin.from("progress").select("hints_used").eq("team_id", user.team_id).eq("level_id", levelId).single(),
      supabaseAdmin.from("event_settings").select("event_start").eq("id", 1).single(),
      supabaseAdmin.from("levels").select("hint_1, hint_2, hint_3").eq("level_id", levelId).single(),
    ]);

    if (teamRes.error || !teamRes.data) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    if (progressRes.error || !progressRes.data) return NextResponse.json({ error: "Level not started" }, { status: 403 });
    if (settingsRes.error || !settingsRes.data) return NextResponse.json({ error: "Event settings not found" }, { status: 500 });
    if (levelRes.error || !levelRes.data) return NextResponse.json({ error: "Level not found" }, { status: 404 });

    const globalHintsUsed = teamRes.data.global_hints_used || 0;
    const levelHintsUsed = progressRes.data.hints_used || [];
    
    // 2. Check if they already unlocked all 3 hints for this level
    if (levelHintsUsed.length >= 3) {
      return NextResponse.json({ error: "Max hints reached for this level" }, { status: 400 });
    }

    // 3. Check if they have a global hint token available
    const eventStart = new Date(settingsRes.data.event_start).getTime();
    const elapsedMinutes = (Date.now() - eventStart) / (1000 * 60);
    const tokensUnlocked = Math.min(MAX_GLOBAL_HINTS, Math.floor(elapsedMinutes / HINT_UNLOCK_INTERVAL_MINUTES));
    
    if (globalHintsUsed >= tokensUnlocked) {
      return NextResponse.json({ error: "No hint tokens available yet" }, { status: 403 });
    }
    
    if (globalHintsUsed >= MAX_GLOBAL_HINTS) {
      return NextResponse.json({ error: "Global hint limit reached" }, { status: 403 });
    }

    // 4. Unlock the next hint
    const nextHintNum = levelHintsUsed.length + 1;
    const newGlobalHintsUsed = globalHintsUsed + 1;
    const newLevelHintsUsed = [...levelHintsUsed, nextHintNum];

    // Transaction-like update
    await supabaseAdmin.from("teams").update({ global_hints_used: newGlobalHintsUsed }).eq("team_id", user.team_id);
    await supabaseAdmin.from("progress").update({ hints_used: newLevelHintsUsed }).eq("team_id", user.team_id).eq("level_id", levelId);

    const hintText = nextHintNum === 1 ? levelRes.data.hint_1 
                   : nextHintNum === 2 ? levelRes.data.hint_2 
                   : levelRes.data.hint_3;

    return NextResponse.json({
      message: `Hint ${nextHintNum} unlocked`,
      hint: { num: nextHintNum, text: hintText },
      global_hints_used: newGlobalHintsUsed,
    });
  } catch (error) {
    console.error("Hint use error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
