import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();

    const { data: solvedLevels, error } = await supabaseAdmin
      .from("progress")
      .select("level_id, solved_at")
      .eq("team_id", user.team_id)
      .not("solved_at", "is", null)
      .order("level_id", { ascending: true });

    if (error) {
      console.error("Fragments fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch fragments" },
        { status: 500 }
      );
    }

    if (!solvedLevels || solvedLevels.length === 0) {
      return NextResponse.json({ fragments: [] });
    }

    const solvedLevelIds = solvedLevels.map((s) => s.level_id);

    const { data: levels } = await supabaseAdmin
      .from("levels")
      .select("level_id, fragment")
      .in("level_id", solvedLevelIds)
      .order("level_id", { ascending: true });

    const fragments = (levels || []).map((l) => ({
      level_id: l.level_id,
      value: l.fragment,
    }));

    return NextResponse.json({ fragments });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Fragments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
