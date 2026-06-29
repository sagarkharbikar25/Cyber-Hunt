import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: team } = await supabase.from("teams").select("fragments").eq("team_id", user.team_id).single();
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const mappedFragments = (team.fragments || []).map((val: string, idx: number) => {
      return {
        level_id: idx + 1,
        value: val || ""
      };
    }).filter((f: any) => f.value !== "");

    return NextResponse.json({ fragments: mappedFragments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
