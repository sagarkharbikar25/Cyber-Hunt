import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { signToken, COOKIE_NAME } from "@/lib/jwt";
import type { AuthPayload } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, team_id } = body;

    if (!email || !team_id) {
      return NextResponse.json(
        { error: "Email and Team ID are required" },
        { status: 400 }
      );
    }

    const { data: team, error } = await supabaseAdmin
      .from("teams")
      .select("*")
      .eq("leader_email", email.toLowerCase().trim())
      .eq("team_id", team_id.toUpperCase().trim())
      .single();

    if (error || !team) {
      return NextResponse.json(
        { error: "Invalid email or Team ID" },
        { status: 401 }
      );
    }

    if (team.is_disqualified) {
      return NextResponse.json(
        { error: "This team has been disqualified" },
        { status: 403 }
      );
    }

    const payload: AuthPayload = {
      team_id: team.team_id,
      leader_email: team.leader_email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 6 * 60 * 60,
    };

    const token = await signToken(payload);

    const { data: progressData } = await supabaseAdmin
      .from("progress")
      .select("level_id, solved_at")
      .eq("team_id", team.team_id)
      .order("level_id", { ascending: true });

    let currentLevel = 1;
    if (progressData) {
      const solvedLevels = progressData.filter((p) => p.solved_at !== null);
      currentLevel = solvedLevels.length + 1;
      if (currentLevel > 10) currentLevel = 10;
    }

    const response = NextResponse.json({
      message: "Login successful",
      team_name: team.team_name,
      current_level: currentLevel,
      team_id: team.team_id,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 6 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
