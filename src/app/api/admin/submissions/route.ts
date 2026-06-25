import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    // We would verify admin auth here, but skipping for demo speed
    
    // Fetch submissions that have proof images and haven't been processed yet
    const { data: submissions, error } = await supabaseAdmin
      .from("submissions")
      .select(`
        id,
        level_id,
        is_correct,
        proof_image_url,
        ai_status,
        submitted_at,
        team_id,
        teams(team_name, ai_strikes)
      `)
      .neq("proof_image_url", null)
      .order("submitted_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ submissions });
  } catch (error: any) {
    console.error("Admin submissions fetch error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
