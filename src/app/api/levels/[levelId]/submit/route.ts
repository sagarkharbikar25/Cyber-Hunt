import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { verifyAnswer } from "@/lib/hash";
import {
  getEventSettings,
  getEventPhase,
  getCurrentLevel,
} from "@/lib/event";
import {
  RATE_LIMIT_ATTEMPTS,
  RATE_LIMIT_WINDOW_MS,
  POINTS_PER_LEVEL,
  HINT_PENALTIES,
} from "@/lib/constants";

export async function POST(
  request: NextRequest,
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
    if (phase !== "active" && phase !== "paused") {
      return NextResponse.json(
        { error: phase === "not_started" ? "Event has not started" : "Event has ended" },
        { status: 403 }
      );
    }

    const currentLevel = await getCurrentLevel(user.team_id);
    if (levelId !== currentLevel) {
      return NextResponse.json(
        { error: "You can only submit answers for your current level" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const answer = formData.get("answer")?.toString();
    const proofFile = formData.get("proof") as File | null;

    if (!answer || typeof answer !== "string") {
      return NextResponse.json({ error: "Answer is required" }, { status: 400 });
    }

    if (!proofFile) {
      return NextResponse.json({ error: "Proof screenshot is required" }, { status: 400 });
    }

    const { data: recentSubmissions } = await supabaseAdmin
      .from("submissions")
      .select("submitted_at")
      .eq("team_id", user.team_id)
      .eq("level_id", levelId)
      .gte(
        "submitted_at",
        new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
      );

    if (
      recentSubmissions &&
      recentSubmissions.length >= RATE_LIMIT_ATTEMPTS
    ) {
      return NextResponse.json(
        {
          error: `Rate limited. Max ${RATE_LIMIT_ATTEMPTS} attempts per minute. Try again shortly.`,
        },
        { status: 429 }
      );
    }

    const { data: level, error: levelError } = await supabaseAdmin
      .from("levels")
      .select("answer_hash, answer_salt, fragment")
      .eq("level_id", levelId)
      .single();

    if (levelError || !level) {
      return NextResponse.json(
        { error: "Level not found" },
        { status: 404 }
      );
    }

    const isCorrect = verifyAnswer(answer, level.answer_hash, level.answer_salt);

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] || "unknown";

    let proofImageUrl = null;
    try {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${user.team_id}-L${levelId}-${Date.now()}.${fileExt}`;
      const { data: uploadData } = await supabaseAdmin.storage
        .from("proofs")
        .upload(fileName, proofFile);
      
      if (uploadData) {
        const { data: publicUrlData } = supabaseAdmin.storage.from("proofs").getPublicUrl(fileName);
        proofImageUrl = publicUrlData.publicUrl;
      }
    } catch (e) {
      console.error("Storage upload failed", e);
    }

    await supabaseAdmin.from("submissions").insert({
      team_id: user.team_id,
      level_id: levelId,
      is_correct: isCorrect,
      proof_image_url: proofImageUrl,
      ip_address: ip,
    });

    const { data: currentProgress } = await supabaseAdmin
      .from("progress")
      .select("attempts")
      .eq("team_id", user.team_id)
      .eq("level_id", levelId)
      .single();

    await supabaseAdmin
      .from("progress")
      .update({ attempts: (currentProgress?.attempts || 0) + 1 })
      .eq("team_id", user.team_id)
      .eq("level_id", levelId);

    if (isCorrect) {
      const now = new Date().toISOString();

      const { data: existingProgress } = await supabaseAdmin
        .from("progress")
        .select("solved_at")
        .eq("team_id", user.team_id)
        .eq("level_id", levelId)
        .single();

      if (existingProgress && !existingProgress.solved_at) {
        await supabaseAdmin
          .from("progress")
          .update({ solved_at: now })
          .eq("team_id", user.team_id)
          .eq("level_id", levelId);
      }

      if (levelId < 10) {
        const { data: nextProgress } = await supabaseAdmin
          .from("progress")
          .select("level_id")
          .eq("team_id", user.team_id)
          .eq("level_id", levelId + 1)
          .single();

        if (!nextProgress) {
          await supabaseAdmin.from("progress").insert({
            team_id: user.team_id,
            level_id: levelId + 1,
            started_at: now,
          });
        }
      }

      const { data: hintsData } = await supabaseAdmin
        .from("progress")
        .select("hints_used")
        .eq("team_id", user.team_id)
        .eq("level_id", levelId)
        .single();

      const hintsUsed = hintsData?.hints_used || [];
      let hintPenalty = 0;
      if (hintsUsed.includes(1)) hintPenalty += HINT_PENALTIES[1];
      if (hintsUsed.includes(2)) hintPenalty += HINT_PENALTIES[2];
      if (hintsUsed.includes(3)) hintPenalty += HINT_PENALTIES[3];
      const levelScore = Math.max(0, POINTS_PER_LEVEL - hintPenalty);

      return NextResponse.json({
        correct: true,
        fragment: level.fragment,
        score: levelScore,
        message: "ACCESS GRANTED — Level cleared",
      });
    }

    return NextResponse.json({
      correct: false,
      message: "ACCESS DENIED — Incorrect answer",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
