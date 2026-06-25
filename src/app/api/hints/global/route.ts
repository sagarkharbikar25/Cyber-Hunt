import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { HINT_UNLOCK_INTERVAL_MINUTES, MAX_GLOBAL_HINTS } from "@/lib/constants";

export async function GET() {
  try {
    const user = await requireAuth();

    // Fetch team info
    const { data: team, error: teamError } = await supabaseAdmin
      .from("teams")
      .select("global_hints_used")
      .eq("team_id", user.team_id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Fetch event settings
    const { data: settings } = await supabaseAdmin
      .from("event_settings")
      .select("event_start")
      .eq("id", 1)
      .single();

    if (!settings) {
      return NextResponse.json({ error: "Event settings missing" }, { status: 500 });
    }

    const eventStart = new Date(settings.event_start).getTime();
    const elapsedMinutes = (Date.now() - eventStart) / (1000 * 60);
    
    // Calculate how many tokens have been unlocked (1 every 10 mins)
    const tokensUnlocked = Math.min(
      MAX_GLOBAL_HINTS,
      Math.floor(elapsedMinutes / HINT_UNLOCK_INTERVAL_MINUTES)
    );

    const tokensAvailable = Math.max(0, tokensUnlocked - team.global_hints_used);

    return NextResponse.json({
      global_hints_used: team.global_hints_used,
      tokens_unlocked: tokensUnlocked,
      tokens_available: tokensAvailable,
      max_global_hints: MAX_GLOBAL_HINTS,
      next_token_minutes: tokensUnlocked < MAX_GLOBAL_HINTS 
        ? HINT_UNLOCK_INTERVAL_MINUTES - (elapsedMinutes % HINT_UNLOCK_INTERVAL_MINUTES)
        : 0,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Global hints error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
