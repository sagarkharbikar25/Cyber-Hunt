import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  getEventSettings,
  getEventPhase,
  getCurrentLevel,
  getTimeRemaining,
} from "@/lib/event";

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();

    const settings = await getEventSettings();
    if (!settings) {
      return NextResponse.json(
        { error: "Event configuration error" },
        { status: 500 }
      );
    }

    const now = new Date();
    const phase = getEventPhase(settings, now);
    const timeRemaining = getTimeRemaining(settings, now);
    const currentLevel = await getCurrentLevel(user.team_id);

    const { data: team } = await supabaseAdmin
      .from("teams")
      .select("team_name, team_id")
      .eq("team_id", user.team_id)
      .single();

    const { data: progressData } = await supabaseAdmin
      .from("progress")
      .select("level_id, solved_at, hints_used")
      .eq("team_id", user.team_id)
      .order("level_id", { ascending: true });

    const solvedLevels = (progressData || []).filter(
      (p) => p.solved_at !== null
    ).length;

    const totalHintsUsed = (progressData || []).reduce((sum, p) => {
      return sum + (p.hints_used?.length || 0);
    }, 0);

    let totalScore = 0;
    for (const p of progressData || []) {
      if (!p.solved_at) continue;
      let levelScore = 100;
      const hints = p.hints_used || [];
      if (hints.includes(1)) levelScore -= 10;
      if (hints.includes(2)) levelScore -= 20;
      if (hints.includes(3)) levelScore -= 30;
      totalScore += Math.max(0, levelScore);
    }

    const { data: allTeams } = await supabaseAdmin
      .from("teams")
      .select("team_id");

    const { data: allProgress } = await supabaseAdmin
      .from("progress")
      .select("team_id, solved_at")
      .not("solved_at", "is", null);

    const teamSolvedMap: Record<string, number> = {};
    for (const p of allProgress || []) {
      teamSolvedMap[p.team_id] = (teamSolvedMap[p.team_id] || 0) + 1;
    }

    const mySolved = solvedLevels;
    let rank = 1;
    for (const t of allTeams || []) {
      if (t.team_id === user.team_id) continue;
      if ((teamSolvedMap[t.team_id] || 0) > mySolved) {
        rank++;
      }
    }

    const { data: fragmentsData } = await supabaseAdmin
      .from("progress")
      .select("level_id, solved_at")
      .eq("team_id", user.team_id)
      .not("solved_at", "is", null);

    const fragments: { level_id: number; value: string }[] = [];
    if (fragmentsData && fragmentsData.length > 0) {
      const { data: levels } = await supabaseAdmin
        .from("levels")
        .select("level_id, fragment")
        .in(
          "level_id",
          fragmentsData.map((f) => f.level_id)
        );
      for (const l of levels || []) {
        fragments.push({ level_id: l.level_id, value: l.fragment });
      }
    }

    return NextResponse.json({
      team_name: team?.team_name || "Unknown",
      team_id: user.team_id,
      rank,
      current_level: currentLevel,
      levels_solved: solvedLevels,
      total_hints_used: totalHintsUsed,
      score: totalScore,
      fragments,
      event_status: phase,
      time_remaining_s: timeRemaining,
      total_paused_ms: settings.total_paused_ms,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
