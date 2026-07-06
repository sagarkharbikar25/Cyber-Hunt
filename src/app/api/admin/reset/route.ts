import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action !== "reset_all") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data: teams, error: fetchError } = await supabase.from('teams').select('team_id');
    
    if (fetchError || !teams) {
      return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
    }

    let resetCount = 0;
    for (const team of teams) {
      const { error: updateError } = await supabase
        .from('teams')
        .update({
          fragments: ["", "", "", "", "", "", "", "", ""],
          score: 0,
          current_level: 1,
          ai_strikes: 0,
          global_hints_used: 0,
          level_hints: {},
          is_disqualified: false,
          started_at: null,
          level10_attempts: 0,
          level10_started_at: null,
          last_submission_at: null,
          extra_minutes: 0
        })
        .eq('team_id', team.team_id);

      if (!updateError) {
        resetCount++;
      }
    }

    // Optional: Delete all submissions and logs
    await supabase.from('submissions').delete().neq('team_id', 'dummy_team');
    await supabase.from('activity_logs').delete().neq('team_id', 'dummy_team');

    return NextResponse.json({ success: true, count: resetCount });
  } catch (error) {
    console.error("Admin reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
