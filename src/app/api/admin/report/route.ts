import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: teamsSnapshot } = await supabase
      .from("teams")
      .select("*")
      .order("score", { ascending: false });

    const teams = (teamsSnapshot || []).map((data, idx) => ({
      rank: idx + 1,
      team_name: data.team_name,
      fragments: data.current_level > 10 ? 10 : (data.fragments || []).filter((f: any) => typeof f === "string" && f.trim() !== "").length,
      hints_used: data.global_hints_used || 0,
      ai_strikes: data.ai_strikes || 0,
      score: data.score || 0, // DUMMY SCORE FOR NOW
      status: data.is_disqualified ? "DISQUALIFIED" : "ACTIVE",
    }));

    return NextResponse.json({ success: true, teams });
  } catch (error) {
    console.error("Report fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
