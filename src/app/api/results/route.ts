import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: configDoc } = await supabase.from("event_settings").select("*").eq("id", "config").single();
    const config = configDoc || {};
    
    // For now, assume results are always "published" in this simple version,
    // or you can check config.results_published
    const isPublished = config.results_published === true;
    
    if (!isPublished) {
      return NextResponse.json({ 
        published: false,
        message: "Results are still being verified."
      }, { status: 403 });
    }

    const { data: teamsSnapshot } = await supabase
      .from("teams")
      .select("*")
      .eq("is_disqualified", false)
      .order("score", { ascending: false })
      .order("current_level", { ascending: false })
      .order("last_submission_at", { ascending: true });

    const teams = (teamsSnapshot || []).map((data, idx) => {
      return {
        rank: idx + 1,
        team_id: data.team_id,
        team_name: data.team_name,
        levels_solved: (data.fragments || []).filter((f: any) => typeof f === "string" && f.trim() !== "").length,
        total_hints: data.global_hints_used || 0,
        score: data.score || 0,
        solved_at: data.last_submission_at || "",
        is_winner: idx === 0,
      };
    });

    const winner = teams[0] || null;

    return NextResponse.json({
      published: true,
      teams,
      winner
    });
  } catch (error) {
    console.error("Results error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
