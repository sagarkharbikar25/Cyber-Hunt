import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { redis, TTL, CK } from "@/lib/redis";

// NOTE: No `export const revalidate` here.
// ISR caching doesn't work reliably on routes that query auth/dynamic data.
// We use explicit Redis caching instead — predictable TTL, works across
// all Vercel function instances simultaneously.

interface LeaderboardRow {
  rank: number;
  team_id: string;
  team_name: string;
  score: number;
  current_level: number;
  levels_solved: number;
  hints_used: number;
}

export async function GET() {
  try {
    // Try Redis cache first
    if (redis) {
      try {
        const cached = await redis.get<LeaderboardRow[]>(CK.leaderboard);
        if (cached) {
          return NextResponse.json({ leaderboard: cached, teams: cached });
        }
      } catch (err) {
        console.error("[leaderboard] Redis read error:", err);
      }
    }

    // Cache miss — query DB
    const { data: teamsSnapshot, error } = await supabase
      .from("teams")
      .select("team_id, team_name, score, current_level, global_hints_used, is_disqualified, last_submission_at, fragments")
      // Select only the columns we need — avoids fetching proof_url
      .eq("is_disqualified", false);

    if (error) {
      console.error("[leaderboard] db error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const allTeams = teamsSnapshot ?? [];

    // Sort: highest score → highest level → earliest last submission
    allTeams.sort((a, b) => {
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      if ((b.current_level || 1) !== (a.current_level || 1)) return (b.current_level || 1) - (a.current_level || 1);
      const tA = a.last_submission_at ? new Date(a.last_submission_at).getTime() : 0;
      const tB = b.last_submission_at ? new Date(b.last_submission_at).getTime() : 0;
      return tA - tB;
    });

    const leaderboard: LeaderboardRow[] = allTeams.map((d: any, idx) => ({
      rank: idx + 1,
      team_id: d.team_id,
      team_name: d.team_name,
      score: d.score || 0,
      current_level: d.current_level || 1,
      levels_solved: d.current_level > 10 ? 10 : (d.fragments || []).filter((f: any) => typeof f === "string" && f.trim() !== "").length,
      hints_used: d.global_hints_used || 0,
    }));

    // Write to Redis — fire-and-forget so we don't delay the response
    if (redis) {
      redis
        .set(CK.leaderboard, leaderboard, { ex: TTL.LEADERBOARD })
        .catch((err) => console.error("[leaderboard] redis write error:", err));
    }

    return NextResponse.json({ leaderboard, teams: leaderboard });
  } catch (error) {
    console.error("[leaderboard] internal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
