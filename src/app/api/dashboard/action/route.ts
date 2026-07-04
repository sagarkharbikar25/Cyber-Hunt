import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";


export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const action = formData.get("action");

    if (action === "save_fragments") {
      const fragmentsStr = formData.get("fragments") as string;
      const fragments = JSON.parse(fragmentsStr);
      await supabase.from("teams").update({ fragments }).eq("team_id", user.team_id);
      return NextResponse.json({ success: true });
    }

    if (action === "hint") {
      const level_id = formData.get("level_id") || "1";
      const hint_num_str = formData.get("hint_num") || "1";
      const hint_num = parseInt(hint_num_str.toString(), 10);
      const lvl = parseInt(level_id.toString(), 10);

      const { data: team } = await supabase.from("teams").select("*").eq("team_id", user.team_id).single();
      if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

      const HINTS: Record<string, Record<string, string>> = {
        "1": {
          "1": "The secret isn't buried in the past; it lives in the present. You must systematically inspect every single file in the provided GitHub repository.",
          "2": "Developers often leave comments or hardcoded secrets behind. Open the files and read the source code line by line to find the hidden fragment."
        },
        "2": {
          "1": "Sometimes you must reuse the exact same credentials to pass a completely different gate. Your operational identity here is the same as your identity there.",
          "2": "Infiltrate the dashboard and secure the PDF document. But do not trust the extension; disguise is the best defense. Force extract or unzip the file to reveal its true contents."
        },
        "3": {
          "1": "The present state of the repository reveals nothing. But code has memory. Where do we look to see what came before?",
          "2": "A footprint remains long after the foot has moved. Track the chronological steps of the creator. A specific commit holds the fragment you seek."
        },
        "4": {
          "1": "Return to the scene of your previous infiltration. The surface layer of that website is a distraction; you must look deeper.",
          "2": "When things break behind the scenes, the browser quietly bleeds red. Use your diagnostic tools to inspect what the machine is secretly complaining about."
        },
        "5": {
          "1": "Organizations don't hide in the shadows; they broadcast their daily activities to the world. Seek out the official social channel of the architects (TechAlfa).",
          "2": "Evidence that vanishes after 24 hours is live right now. You must watch their temporary visual broadcasts very carefully—the secret is hidden among the noise."
        },
        "6": {
          "1": "The deepest secrets are hidden in plain sight on the official TechAlfa website's most boring page. Read every single line of the legal jargon; the answer lies just below a button.",
          "2": "Sometimes, words are written in the exact same color as their surroundings. You must select everything on the screen to force the invisible text into the light."
        },
        "7": {
          "1": "Compute the four trials systematically. When their solutions are stitched together sequentially, they will form a pathway to a professional network.",
          "2": "Once you reach the destination, look back at the very beginning of this journey. Find the professional announcement for this exact operation; the secret is buried in its text."
        },
        "8": {
          "1": "The scrambled text is a one-way mathematical transformation. It cannot be reversed, but it can be matched.",
          "2": "Isolate the target. You do not need to do the math yourself—visit https://crackstation.net/ to restore its true form."
        },
        "9": {
          "1": "Something loads and disappears before you can click it. Reloading won't help if you weren't already looking.",
          "2": "There's a setting near where you were looking. It changes whether old results get reused."
        }
      };

      const hintText = HINTS[lvl.toString()]?.[hint_num.toString()] || "Hint not found.";

      // Track hints per level
      const levelHints = team.level_hints || {};
      const currentHintsForLevel = levelHints[lvl.toString()] || 0;
      let globalHints = team.global_hints_used || 0;

      // Only increment if they haven't already taken this hint number
      if (hint_num > currentHintsForLevel) {
        levelHints[lvl.toString()] = hint_num;
        globalHints += 1;
      }

      await supabase.from("teams").update({
        level_hints: levelHints,
        global_hints_used: globalHints
      }).eq("team_id", user.team_id);

      // Log activity
      await supabase.from("activity_logs").insert({
        message: `${team.team_name} decrypted Hint ${hint_num} for Level ${lvl} (-${hint_num === 1 ? '20' : '30'}% score penalty)`
      });

      return NextResponse.json({ success: true, hint: hintText });
    }

    if (action === "submit") {
      const answer = formData.get("answer") as string;
      const proofBase64 = formData.get("proofBase64") as string;
      const level_id_str = formData.get("level_id") as string;
      const level_id = parseInt(level_id_str, 10) || 1;

      if (!answer || !proofBase64) return NextResponse.json({ error: "Answer and proof are required" }, { status: 400 });

      const { data: teamData } = await supabase.from("teams").select("*").eq("team_id", user.team_id).single();
      if (!teamData) return NextResponse.json({ error: "Team not found" }, { status: 404 });

      if (level_id === 10) {
        const attempts = teamData.level10_attempts || 0;
        if (attempts >= 2) {
          return NextResponse.json({ error: "MAXIMUM ATTEMPTS REACHED. MISSION LOCKED." }, { status: 403 });
        }
        if (answer.toUpperCase().trim() !== "ARCHLINUX") {
          await supabase.from("teams").update({ level10_attempts: attempts + 1 }).eq("team_id", user.team_id);
          const remaining = 2 - (attempts + 1);
          if (remaining <= 0) {
            return NextResponse.json({ error: "INCORRECT KEY. Maximum attempts reached. Mission locked." }, { status: 403 });
          } else {
            return NextResponse.json({ error: `INCORRECT KEY. You have ${remaining} chance(s) remaining.` }, { status: 400 });
          }
        }
      }

      // Store the submission for Admin review
      await supabase.from("submissions").insert({
        team_id: user.team_id,
        team_name: teamData.team_name,
        level_id: level_id,
        answer: answer.toUpperCase().trim(),
        proof_url: proofBase64,
        status: "pending"
      });

      // INSTANT ADVANCEMENT: User unlocks fragment immediately
      const POINTS_MAP = [100, 150, 220, 320, 450, 600, 800, 1050, 1350, 2000];
      const basePoints = POINTS_MAP[level_id - 1] || 1000;

      // Apply point penalty based on hints used for THIS level
      const hintsUsed = teamData.level_hints?.[level_id.toString()] || 0;
      let multiplier = 1.0;
      if (hintsUsed === 1) multiplier = 0.8; // -20%
      else if (hintsUsed >= 2) multiplier = 0.5; // -50% (-20% then -30%)

      const scoreInc = Math.floor(basePoints * multiplier);
      const newScore = (teamData.score || 0) + scoreInc;

      const fragments = teamData.fragments || Array(9).fill("");
      const levelIndex = level_id - 1;

      if (levelIndex >= 0 && levelIndex < 9) {
        fragments[levelIndex] = answer.substring(0, 1).toUpperCase();
      } else if (levelIndex === 9) {
        // Level 10 submission (final word)
      }

      const updatePayload: any = {
        score: newScore,
        last_submission_at: new Date().toISOString(),
        fragments,
        current_level: Math.max(teamData.current_level || 1, level_id < 10 ? level_id + 1 : 10)
      };

      if (level_id === 9) {
        updatePayload.level10_started_at = new Date().toISOString();
      }

      await supabase.from("teams").update(updatePayload).eq("team_id", user.team_id);

      await supabase.from("activity_logs").insert({
        message: `${teamData.team_name} uploaded Intel for Level ${level_id}.`
      });

      return NextResponse.json({ success: true, message: `Submission for Level ${level_id} sent!` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Dashboard action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
