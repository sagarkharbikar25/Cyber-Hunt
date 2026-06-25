import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(_request: NextRequest) {
  try {
    const user = await requireAuth();

    const { data: level10Progress } = await supabaseAdmin
      .from("progress")
      .select("solved_at")
      .eq("team_id", user.team_id)
      .eq("level_id", 10)
      .single();

    if (!level10Progress?.solved_at) {
      return NextResponse.json(
        { error: "You must complete Level 10 first" },
        { status: 403 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from("final_submissions")
      .select("submission_id, level10_solved_at")
      .eq("team_id", user.team_id)
      .single();

    if (existing) {
      return NextResponse.json({
        submission_id: existing.submission_id,
        solved_at: existing.level10_solved_at,
        redirect: "/submit",
        message: "Submission already exists",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("final_submissions")
      .insert({
        team_id: user.team_id,
        level10_solved_at: level10Progress.solved_at,
        status: "pending",
      })
      .select("submission_id, level10_solved_at")
      .single();

    if (error) {
      console.error("Final submission error:", error);
      return NextResponse.json(
        { error: "Failed to create submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      submission_id: data.submission_id,
      solved_at: data.level10_solved_at,
      redirect: "/submit",
      message: "Final submission recorded",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Submit final error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
