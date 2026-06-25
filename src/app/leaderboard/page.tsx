"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import LeaderboardTable from "@/components/game/leaderboard-table";
import Card, { CardBody } from "@/components/ui/card";

interface LeaderboardEntry {
  rank: number;
  team_name: string;
  team_id: string;
  levels_solved: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTeamId, setCurrentTeamId] = useState<string>("");

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setTeams(data.teams || []);
    } catch (err) {
      console.error("Leaderboard error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentTeamId(data.team?.team_id || "");
      }
    } catch {
      // not logged in
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    fetchMe();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard, fetchMe]);

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-bold text-text">
            Live Leaderboard
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs text-text3 hover:text-accent transition-colors cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>

        <Card>
          <CardBody className="p-0">
            {loading ? (
              <div className="py-8 text-center text-accent font-mono text-sm animate-pulse">
                Loading leaderboard...
              </div>
            ) : (
              <LeaderboardTable
                teams={teams}
                currentTeamId={currentTeamId}
              />
            )}
          </CardBody>
        </Card>

        <p className="text-text3 text-xs text-center mt-4">
          Leaderboard refreshes every 30 seconds. Scores hidden during event.
        </p>
      </main>
    </div>
  );
}
