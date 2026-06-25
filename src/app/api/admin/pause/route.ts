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
    const { action } = body;

    if (action !== "pause" && action !== "resume") {
      return NextResponse.json(
        { error: 'Action must be "pause" or "resume"' },
        { status: 400 }
      );
    }

    const { data: settings, error: fetchError } = await supabaseAdmin
      .from("event_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (fetchError || !settings) {
      return NextResponse.json(
        { error: "Event settings not found" },
        { status: 500 }
      );
    }

    if (action === "pause") {
      if (settings.is_paused) {
        return NextResponse.json(
          { error: "Event is already paused" },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("event_settings")
        .update({
          is_paused: true,
          paused_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (error) {
        console.error("Pause error:", error);
        return NextResponse.json(
          { error: "Failed to pause event" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Event paused successfully",
        is_paused: true,
      });
    }

    if (action === "resume") {
      if (!settings.is_paused) {
        return NextResponse.json(
          { error: "Event is not paused" },
          { status: 400 }
        );
      }

      const pausedAt = settings.paused_at
        ? new Date(settings.paused_at).getTime()
        : Date.now();
      const pauseDurationMs = Date.now() - pausedAt;

      const { error } = await supabaseAdmin
        .from("event_settings")
        .update({
          is_paused: false,
          paused_at: null,
          total_paused_ms: settings.total_paused_ms + pauseDurationMs,
        })
        .eq("id", 1);

      if (error) {
        console.error("Resume error:", error);
        return NextResponse.json(
          { error: "Failed to resume event" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Event resumed successfully",
        is_paused: false,
        pause_duration_ms: pauseDurationMs,
        total_paused_ms: settings.total_paused_ms + pauseDurationMs,
      });
    }
  } catch (error) {
    console.error("Admin pause error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
