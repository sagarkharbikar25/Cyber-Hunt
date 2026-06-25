import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getEventSettings, getEventPhase } from "@/lib/event";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const GRACE_PERIOD_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const settings = await getEventSettings();
    if (!settings) {
      return NextResponse.json(
        { error: "Event configuration error" },
        { status: 500 }
      );
    }

    const phase = getEventPhase(settings, new Date());
    const eventEndMs =
      new Date(settings.event_end).getTime() + settings.total_paused_ms;
    const withinGrace = Date.now() <= eventEndMs + GRACE_PERIOD_MS;

    if (phase === "ended" && !withinGrace) {
      return NextResponse.json(
        { error: "Submission window has closed" },
        { status: 403 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from("final_submissions")
      .select("submission_id, screenshot_url")
      .eq("team_id", user.team_id)
      .single();

    if (existing?.screenshot_url) {
      return NextResponse.json(
        { error: "You have already uploaded a screenshot" },
        { status: 409 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("screenshot") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 5MB." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use PNG, JPG, or WebP." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split(".").pop() || "png";
    const filePath = `screenshots/${user.team_id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("submissions")
      .upload(filePath, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("submissions")
      .getPublicUrl(filePath);

    const screenshotUrl = urlData.publicUrl;

    if (existing) {
      await supabaseAdmin
        .from("final_submissions")
        .update({
          screenshot_url: screenshotUrl,
          screenshot_uploaded_at: new Date().toISOString(),
        })
        .eq("submission_id", existing.submission_id);
    } else {
      const { data: level10Progress } = await supabaseAdmin
        .from("progress")
        .select("solved_at")
        .eq("team_id", user.team_id)
        .eq("level_id", 10)
        .single();

      await supabaseAdmin.from("final_submissions").insert({
        team_id: user.team_id,
        level10_solved_at: level10Progress?.solved_at || new Date().toISOString(),
        screenshot_url: screenshotUrl,
        screenshot_uploaded_at: new Date().toISOString(),
        status: "pending",
      });
    }

    return NextResponse.json({
      success: true,
      uploaded_at: new Date().toISOString(),
      message: "Screenshot uploaded successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
