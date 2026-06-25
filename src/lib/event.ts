import { supabaseAdmin } from "@/lib/supabase/server";
import type { EventSettings, EventPhase } from "@/types";

export async function getEventSettings(): Promise<EventSettings | null> {
  const { data, error } = await supabaseAdmin
    .from("event_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) return null;
  return data;
}

export function getEventPhase(settings: EventSettings, now: Date): EventPhase {
  if (settings.is_paused) return "paused";
  const nowMs = now.getTime();
  const startMs = new Date(settings.event_start).getTime();
  const endMs =
    new Date(settings.event_end).getTime() + settings.total_paused_ms;
  if (nowMs < startMs) return "not_started";
  if (nowMs >= endMs) return "ended";
  return "active";
}

export function getTimeRemaining(settings: EventSettings, now: Date): number {
  if (settings.is_paused) {
    if (settings.paused_at) {
      return Math.max(
        0,
        Math.floor(
          (new Date(settings.event_end).getTime() -
            new Date(settings.paused_at).getTime()) /
            1000
        )
      );
    }
    return 0;
  }
  const endMs =
    new Date(settings.event_end).getTime() + settings.total_paused_ms;
  const remaining = Math.max(0, Math.floor((endMs - now.getTime()) / 1000));
  return remaining;
}

export async function getCurrentLevel(teamId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from("progress")
    .select("level_id, solved_at")
    .eq("team_id", teamId)
    .order("level_id", { ascending: true });

  if (!data) return 1;

  const solved = data.filter((p) => p.solved_at !== null);
  const nextLevel = solved.length + 1;
  return nextLevel > 10 ? 10 : nextLevel;
}

export async function calculateScore(teamId: string): Promise<number> {
  const { data: progressData } = await supabaseAdmin
    .from("progress")
    .select("level_id, solved_at, hints_used")
    .eq("team_id", teamId)
    .eq("team_id", teamId);

  if (!progressData) return 0;

  let totalScore = 0;
  for (const p of progressData) {
    if (!p.solved_at) continue;
    let levelScore = 100;
    const hints = p.hints_used || [];
    if (hints.includes(1)) levelScore -= 10;
    if (hints.includes(2)) levelScore -= 20;
    if (hints.includes(3)) levelScore -= 30;
    totalScore += Math.max(0, levelScore);
  }
  return totalScore;
}
