import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { submission_id, team_id } = await request.json();

    if (!submission_id || !team_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Mark submission as having an AI strike
    await supabaseAdmin
      .from("submissions")
      .update({ ai_status: "flagged" })
      .eq("id", submission_id);

    // 2. Fetch current strikes for the team
    const { data: teamData } = await supabaseAdmin
      .from("teams")
      .select("ai_strikes")
      .eq("team_id", team_id)
      .single();
    
    let currentStrikes = teamData?.ai_strikes || 0;
    currentStrikes += 1;

    // 3. Update team strikes
    const updatePayload: any = { ai_strikes: currentStrikes };
    let disqualified = false;

    if (currentStrikes >= 4) {
      // Disqualify team instantly
      updatePayload.is_disqualified = true;
      disqualified = true;
    }

    await supabaseAdmin
      .from("teams")
      .update(updatePayload)
      .eq("team_id", team_id);

    return NextResponse.json({ 
      success: true, 
      strikes: currentStrikes,
      disqualified 
    });
  } catch (error) {
    console.error("Admin strike error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
