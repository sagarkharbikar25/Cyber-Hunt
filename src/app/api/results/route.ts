import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const revalidate = 60;

export async function GET(_request: NextRequest) {
  try {
    const { data: settings } = await supabaseAdmin
      .from("event_settings")
      .select("results_published")
      .eq("id", 1)
      .single();

    if (!settings?.results_published) {
      return NextResponse.json(
        { message: "Results will be announced soon. Stay tuned!" },
        { status: 403 }
      );
    }

    const { data: finalSubs } = await supabaseAdmin
      .from("final_submissions")
      .select("team_id, level10_solved_at, status, is_winner")
      .order("level10_solved_at", { ascending: true });

    if (!finalSubs || finalSubs.length === 0) {
      return NextResponse.json({ teams: [], winner: null });
    }

    const teamIds = finalSubs.map((f) => f.team_id);

    const { data: teams } = await supabaseAdmin
      .from("teams")
      .select("team_id, team_name, is_disqualified")
      .in("team_id", teamIds);

    const teamMap: Record<string, { team_name: string; is_disqualified: boolean }> = {};
    for (const t of teams || []) {
      teamMap[t.team_id] = {
        team_name: t.team_name,
        is_disqualified: t.is_disqualified,
      };
    }

    const { data: allProgress } = await supabaseAdmin
      .from("progress")
      .select("team_id, level_id, solved_at, hints_used")
      .not("solved_at", "is", null)
      .in("team_id", teamIds);

    const teamStats: Record<
      string,
      { levels_solved: number; total_hints: number; latest_solve: number }
    > = {};
    for (const p of allProgress || []) {
      if (!teamStats[p.team_id]) {
        teamStats[p.team_id] = {
          levels_solved: 0,
          total_hints: 0,
          latest_solve: 0,
        };
      }
      teamStats[p.team_id].levels_solved += 1;
      const hints = p.hints_used || [];
      teamStats[p.team_id].total_hints += hints.length;
      const solveTime = new Date(p.solved_at).getTime();
      if (solveTime > teamStats[p.team_id].latest_solve) {
        teamStats[p.team_id].latest_solve = solveTime;
      }
    }

    const results = finalSubs
      .filter((f) => !teamMap[f.team_id]?.is_disqualified)
      .map((f) => {
        const stats = teamStats[f.team_id] || {
          levels_solved: 0,
          total_hints: 0,
          latest_solve: 0,
        };
        let totalScore = 0;
        const teamProgress = (allProgress || []).filter(
          (p) => p.team_id === f.team_id
        );
        for (const p of teamProgress) {
          if (!p.solved_at) continue;
          let levelScore = 100;
          const hints = p.hints_used || [];
          if (hints.includes(1)) levelScore -= 10;
          if (hints.includes(2)) levelScore -= 20;
          if (hints.includes(3)) levelScore -= 30;
          totalScore += Math.max(0, levelScore);
        }

        return {
          team_id: f.team_id,
          team_name: teamMap[f.team_id]?.team_name || "Unknown",
          levels_solved: stats.levels_solved,
          total_hints: stats.total_hints,
          score: totalScore,
          solved_at: f.level10_solved_at,
          is_winner: f.is_winner,
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.levels_solved !== b.levels_solved)
          return b.levels_solved - a.levels_solved;
        return new Date(a.solved_at).getTime() - new Date(b.solved_at).getTime();
      })
      .map((t, i) => ({ ...t, rank: i + 1 }));

    const winner = results.find((r) => r.is_winner) || null;

    return NextResponse.json({ teams: results, winner });
  } catch (error) {
    console.error("Results error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
