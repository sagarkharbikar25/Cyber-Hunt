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
    const { team_id, level_id } = body;

    if (!team_id || !level_id) {
      return NextResponse.json(
        { error: "team_id and level_id are required" },
        { status: 400 }
      );
    }

    const levelId = parseInt(level_id, 10);
    if (isNaN(levelId) || levelId < 1 || levelId > 10) {
      return NextResponse.json(
        { error: "Invalid level_id. Must be 1-10." },
        { status: 400 }
      );
    }

    const { data: team } = await supabaseAdmin
      .from("teams")
      .select("team_id, team_name")
      .eq("team_id", team_id)
      .single();

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    for (let i = 1; i < levelId; i++) {
      const { data: existing } = await supabaseAdmin
        .from("progress")
        .select("level_id")
        .eq("team_id", team_id)
        .eq("level_id", i)
        .single();

      if (!existing) {
        await supabaseAdmin.from("progress").insert({
          team_id,
          level_id: i,
          started_at: now,
          solved_at: now,
        });
      } else {
        await supabaseAdmin
          .from("progress")
          .update({ solved_at: now })
          .eq("team_id", team_id)
          .eq("level_id", i)
          .is("solved_at", null);
      }
    }

    const { data: currentLevel } = await supabaseAdmin
      .from("progress")
      .select("level_id")
      .eq("team_id", team_id)
      .eq("level_id", levelId)
      .single();

    if (!currentLevel) {
      await supabaseAdmin.from("progress").insert({
        team_id,
        level_id: levelId,
        started_at: now,
      });
    }

    return NextResponse.json({
      message: `Level ${levelId} unlocked for team ${team_id}`,
      team_name: team.team_name,
      unlocked_level: levelId,
    });
  } catch (error) {
    console.error("Force-unlock error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
