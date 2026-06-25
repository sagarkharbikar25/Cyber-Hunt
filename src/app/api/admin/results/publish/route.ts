import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const adminToken = request.cookies.get("cyberhunt_admin")?.value;
  if (!adminToken) return false;
  const payload = await verifyToken(adminToken);
  if (!payload) return false;
  return (payload as unknown as Record<string, unknown>).role === "admin";
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 401 });
    }

    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const body = await request.json();
    const { winner_team_id } = body;

    const { error: settingsError } = await supabaseAdmin
      .from("event_settings")
      .update({
        results_published: true,
      })
      .eq("id", 1);

    if (settingsError) {
      console.error("Publish settings error:", settingsError);
      return NextResponse.json(
        { error: "Failed to publish results" },
        { status: 500 }
      );
    }

    if (winner_team_id) {
      const { data: existingWinner } = await supabaseAdmin
        .from("final_submissions")
        .select("submission_id")
        .eq("team_id", winner_team_id)
        .single();

      if (existingWinner) {
        await supabaseAdmin
          .from("final_submissions")
          .update({
            is_winner: true,
            status: "verified",
          })
          .eq("submission_id", existingWinner.submission_id);
      }

      await supabaseAdmin
        .from("teams")
        .update({ is_disqualified: false })
        .eq("team_id", winner_team_id);
    }

    return NextResponse.json({
      message: "Results published successfully",
      winner_team_id: winner_team_id || null,
    });
  } catch (error) {
    console.error("Publish results error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
