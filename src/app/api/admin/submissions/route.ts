import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // 1. Fetch all submissions
    const { data: submissionsSnapshot } = await supabase
      .from("submissions")
      .select("*")
      .order("timestamp", { ascending: false });

    const submissionsData = submissionsSnapshot || [];

    // 2. Fetch all teams ONCE to avoid N+1 query problem (which causes 504 Timeouts)
    const { data: teamsSnapshot } = await supabase
      .from("teams")
      .select("team_id, ai_strikes, global_hints_used");
      
    // 3. Create a fast lookup map
    const teamLookup: Record<string, { ai_strikes: number, hints_used: number }> = {};
    if (teamsSnapshot) {
      teamsSnapshot.forEach(team => {
        teamLookup[team.team_id] = {
          ai_strikes: team.ai_strikes || 0,
          hints_used: team.global_hints_used || 0
        };
      });
    }

    // 4. Map the data synchronously
    const submissions = submissionsData.map((data) => {
      const teamStats = teamLookup[data.team_id] || { ai_strikes: 0, hints_used: 0 };
      
      const ts = data.timestamp;
      const date = new Date(ts || Date.now());

      return {
        id: data.id,
        team_id: data.team_id,
        team_name: data.team_name,
        level_id: data.level_id,
        answer: data.answer,
        proof_url: data.proof_url,
        status: data.status,
        submitted_at: date.toISOString(),
        ai_strikes: teamStats.ai_strikes,
        hints_used: teamStats.hints_used
      };
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Admin submissions fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
