import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { target_team_id, attack_type } = body;

    if (!target_team_id || !attack_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (target_team_id === user.team_id) {
      return NextResponse.json({ error: "You cannot attack yourself" }, { status: 400 });
    }

    // Define attack costs and durations
    const attacks = {
      ddos: { cost: 50, durationMinutes: 3 },
      ransomware: { cost: 100, durationMinutes: 2 },
    };

    const attackConfig = attacks[attack_type as keyof typeof attacks];
    if (!attackConfig) {
      return NextResponse.json({ error: "Invalid attack type" }, { status: 400 });
    }

    // 1. Get attacker's current coins
    const { data: attacker } = await supabase
      .from("teams")
      .select("coins, team_name")
      .eq("team_id", user.team_id)
      .single();

    if (!attacker) return NextResponse.json({ error: "Attacker not found" }, { status: 404 });

    const currentCoins = attacker.coins || 0;
    if (currentCoins < attackConfig.cost) {
      return NextResponse.json({ error: "Insufficient coins" }, { status: 400 });
    }

    // 2. Deduct coins
    const { error: deductError } = await supabase
      .from("teams")
      .update({ coins: currentCoins - attackConfig.cost })
      .eq("team_id", user.team_id);

    if (deductError) {
      console.error("[sabotage] Error deducting coins:", deductError);
      return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 });
    }

    // 3. Create the attack
    const expiresAt = new Date(Date.now() + attackConfig.durationMinutes * 60 * 1000).toISOString();
    
    const { error: attackError } = await supabase
      .from("active_attacks")
      .insert({
        attacker_team_id: user.team_id,
        target_team_id,
        attack_type,
        expires_at: expiresAt
      });

    if (attackError) {
      console.error("[sabotage] Error creating attack:", attackError);
      // Try to refund coins if attack fails
      await supabase.from("teams").update({ coins: currentCoins }).eq("team_id", user.team_id);
      return NextResponse.json({ error: "Failed to launch attack" }, { status: 500 });
    }

    // 4. Log the activity
    await supabase.from("activity_logs").insert({
      message: `Team ${attacker.team_name} launched a ${attack_type.toUpperCase()} attack!`
    });

    return NextResponse.json({ success: true, message: "Attack launched successfully!" });

  } catch (error) {
    console.error("[sabotage] internal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
