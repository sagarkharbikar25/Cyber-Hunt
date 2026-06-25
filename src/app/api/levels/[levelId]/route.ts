import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  getEventSettings,
  getEventPhase,
  getCurrentLevel,
} from "@/lib/event";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ levelId: string }> }
) {
  try {
    const user = await requireAuth();
    const { levelId: levelIdStr } = await params;
    const levelId = parseInt(levelIdStr, 10);

    if (isNaN(levelId) || levelId < 1 || levelId > 10) {
      return NextResponse.json({ error: "Invalid level ID" }, { status: 400 });
    }

    const settings = await getEventSettings();
    if (!settings) {
      return NextResponse.json(
        { error: "Event configuration error" },
        { status: 500 }
      );
    }

    const phase = getEventPhase(settings, new Date());
    if (phase === "not_started") {
      return NextResponse.json(
        { error: "Event has not started yet" },
        { status: 403 }
      );
    }
    if (phase === "ended") {
      return NextResponse.json(
        { error: "Event has ended" },
        { status: 403 }
      );
    }

    const currentLevel = await getCurrentLevel(user.team_id);
    if (levelId > currentLevel) {
      return NextResponse.json(
        { error: "You haven't reached this level yet" },
        { status: 403 }
      );
    }

    const { data: level, error } = await supabaseAdmin
      .from("levels")
      .select("level_id, title, challenge_type, content_html, fragment")
      .eq("level_id", levelId)
      .eq("is_active", true)
      .single();

    if (error || !level) {
      return NextResponse.json(
        { error: "Level not found" },
        { status: 404 }
      );
    }

    const { data: progress } = await supabaseAdmin
      .from("progress")
      .select("solved_at")
      .eq("team_id", user.team_id)
      .eq("level_id", levelId)
      .single();

    const isSolved = progress?.solved_at !== null;

    return NextResponse.json({
      ...level,
      is_solved: isSolved,
      current_level: currentLevel,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Level GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
