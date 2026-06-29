import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { HINT_UNLOCK_INTERVAL_MINUTES, MAX_GLOBAL_HINTS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: team } = await supabase.from("teams").select("*").eq("team_id", user.team_id).single();
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const startTime = team.started_at ? new Date(team.started_at).getTime() : Date.now();
    const elapsedMinutes = (Date.now() - startTime) / 60000;

    const tokens_unlocked = Math.min(MAX_GLOBAL_HINTS, Math.floor(elapsedMinutes / HINT_UNLOCK_INTERVAL_MINUTES));
    const next_token_minutes = Math.max(0, HINT_UNLOCK_INTERVAL_MINUTES - (elapsedMinutes % HINT_UNLOCK_INTERVAL_MINUTES));

    return NextResponse.json({
      global_hints_used: team.global_hints_used || 0,
      tokens_unlocked,
      tokens_available: Math.max(0, tokens_unlocked - (team.global_hints_used || 0)),
      max_global_hints: MAX_GLOBAL_HINTS,
      next_token_minutes
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
