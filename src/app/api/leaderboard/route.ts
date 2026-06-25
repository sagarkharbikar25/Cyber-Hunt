import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const revalidate = 25;

export async function GET(_request: NextRequest) {
  try {
    const { data: progressData, error: progressError } = await supabaseAdmin
      .from("progress")
      .select("team_id, level_id, solved_at, hints_used")
      .not("solved_at", "is", null);

    if (progressError) {
      console.error("Leaderboard progress error:", progressError);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 }
      );
    }

    const { data: eventSettings } = await supabaseAdmin
      .from("event_settings")
      .select("event_start, total_paused_ms")
      .eq("id", 1)
      .single();

    const eventStart = eventSettings
      ? new Date(eventSettings.event_start).getTime()
      : Date.now();

    const teamMap: Record<
      string,
      {
        team_id: string;
        levels_solved: number;
        total_hints: number;
        latest_solve: number;
      }
    > = {};

    for (const p of progressData || []) {
      if (!teamMap[p.team_id]) {
        teamMap[p.team_id] = {
          team_id: p.team_id,
          levels_solved: 0,
          total_hints: 0,
          latest_solve: 0,
        };
      }
      teamMap[p.team_id].levels_solved += 1;
      const hints = p.hints_used || [];
      teamMap[p.team_id].total_hints += hints.length;
      const solveTime = new Date(p.solved_at).getTime();
      if (solveTime > teamMap[p.team_id].latest_solve) {
        teamMap[p.team_id].latest_solve = solveTime;
      }
    }

    const teamIds = Object.keys(teamMap);
    if (teamIds.length === 0) {
      return NextResponse.json({ teams: [] });
    }

    const { data: teams } = await supabaseAdmin
      .from("teams")
      .select("team_id, team_name, is_disqualified")
      .in("team_id", teamIds);

    const teamNameMap: Record<string, { team_name: string; is_disqualified: boolean }> = {};
    for (const t of teams || []) {
      teamNameMap[t.team_id] = {
        team_name: t.team_name,
        is_disqualified: t.is_disqualified,
      };
    }

    const leaderboard = Object.values(teamMap)
      .filter((t) => !teamNameMap[t.team_id]?.is_disqualified)
      .map((t) => {
        const levelScore = t.levels_solved * 100;
        const hintPenalty = t.total_hints * 0;
        const timeTakenS = Math.max(0, (t.latest_solve - eventStart) / 1000);
        const timePenalty = timeTakenS * 0;

        return {
          team_id: t.team_id,
          team_name: teamNameMap[t.team_id]?.team_name || "Unknown",
          levels_solved: t.levels_solved,
          latest_solve: t.latest_solve,
        };
      })
      .sort((a, b) => {
        if (b.levels_solved !== a.levels_solved) {
          return b.levels_solved - a.levels_solved;
        }
        return a.latest_solve - b.latest_solve;
      })
      .slice(0, 20)
      .map((t, i) => ({
        rank: i + 1,
        team_name: t.team_name,
        team_id: t.team_id,
        levels_solved: t.levels_solved,
      }));

    return NextResponse.json({ teams: leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
