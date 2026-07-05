import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { minutes, team_id } = await request.json();

    if (!minutes || typeof minutes !== "number" || minutes < 0) {
      return NextResponse.json({ error: "Invalid minutes value" }, { status: 400 });
    }

    if (team_id) {
      // Grant extra time to a SINGLE team
      const { data: team } = await supabase
        .from("teams")
        .select("team_name, extra_minutes")
        .eq("team_id", team_id)
        .single();

      if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

      const newExtra = (team.extra_minutes || 0) + minutes;

      await supabase
        .from("teams")
        .update({ extra_minutes: newExtra })
        .eq("team_id", team_id);

      await supabase.from("activity_logs").insert({
        message: `Mission Control granted +${minutes} min extra time to ${team.team_name}.`
      });

      return NextResponse.json({ success: true, message: `+${minutes} min granted to ${team.team_name}` });

    } else {
      // Grant extra time to ALL teams
      const { data: teams, error } = await supabase
        .from("teams")
        .select("team_id, extra_minutes");

      if (error || !teams) {
        return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
      }

      // Update each team's extra_minutes by adding the new amount
      const updates = teams.map(team =>
        supabase
          .from("teams")
          .update({ extra_minutes: (team.extra_minutes || 0) + minutes })
          .eq("team_id", team.team_id)
      );

      await Promise.all(updates);

      await supabase.from("activity_logs").insert({
        message: `⏱️ Mission Control granted +${minutes} min extra time to ALL ${teams.length} teams due to downtime.`
      });

      return NextResponse.json({
        success: true,
        message: `+${minutes} min granted to all ${teams.length} teams`
      });
    }

  } catch (error) {
    console.error("Extra time error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
