import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { signToken, COOKIE_NAME } from "@/lib/jwt";
import { loginRatelimit, checkRateLimit } from "@/lib/rate-limit";
import type { AuthPayload } from "@/types";

export async function POST(request: NextRequest) {
  // --- Rate limiting: keyed on IP so one IP can't hammer the DB ----------
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const limited = await checkRateLimit(loginRatelimit, `login:${ip}`);
  if (limited) {
    console.warn(`[login] rate-limited ip=${ip}`);
    return limited;
  }
  // -----------------------------------------------------------------------

  try {
    const body = await request.json();
    const { email, team_id } = body;

    if (!email || !team_id) {
      return NextResponse.json(
        { error: "Email and Team ID are required" },
        { status: 400 }
      );
    }

    const { data: team, error } = await supabase
      .from("teams")
      .select("*")
      .eq("team_id", team_id.toUpperCase().trim())
      .single();

    if (error || !team) {
      // Log invalid login attempts so they're visible in Vercel logs
      console.warn(`[login] failed: team_id=${team_id} ip=${ip} reason=not_found`);
      return NextResponse.json(
        { error: "Invalid Team ID" },
        { status: 401 }
      );
    }

    if (team.leader_email.toLowerCase() !== email.toLowerCase().trim()) {
      console.warn(`[login] failed: team_id=${team_id} ip=${ip} reason=email_mismatch`);
      return NextResponse.json(
        { error: "Invalid email for this Team ID" },
        { status: 401 }
      );
    }

    if (team.is_disqualified) {
      console.warn(`[login] blocked: team_id=${team_id} reason=disqualified`);
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
    const currentLevel = team.current_level || 1;

    console.log(`[login] success: team_id=${team_id} level=${currentLevel}`);

    const response = NextResponse.json({
      message: "Login successful",
      team_name: team.team_name,
      current_level: currentLevel,
      team_id: team.team_id,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // was hardcoded false — fixed
      sameSite: "lax",
      path: "/",
      maxAge: 6 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error(`[login] internal error ip=${ip}`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
