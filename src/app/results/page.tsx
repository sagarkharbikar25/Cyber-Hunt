"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Card, { CardBody } from "@/components/ui/card";
import Button from "@/components/ui/button";

interface ResultEntry {
  rank: number;
  team_name: string;
  team_id: string;
  levels_solved: number;
  total_hints: number;
  score: number;
  solved_at: string;
  is_winner: boolean;
}

export default function ResultsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<ResultEntry[]>([]);
  const [winner, setWinner] = useState<ResultEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [notPublished, setNotPublished] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch("/api/results");
      if (res.status === 403) {
        setNotPublished(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setTeams(data.teams || []);
      setWinner(data.winner || null);
    } catch (err) {
      console.error("Results error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-accent font-mono text-sm animate-pulse">
          Loading results...
        </div>
      </div>
    );
  }

  if (notPublished) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <Card>
            <CardBody className="text-center py-12">
              <div className="text-5xl mb-4">&#9202;</div>
              <h1 className="font-display text-2xl font-bold mb-2 text-text">
                Results Coming Soon
              </h1>
              <p className="text-text3 text-sm mb-6">
                Results will be announced by the organizer after verification.
                Stay tuned!
              </p>
              <Button
                variant="secondary"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </CardBody>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="font-display text-xl font-bold text-text mb-6 text-center">
          Final Results
        </h1>

        {/* Winner Banner */}
        {winner && (
          <Card glow="green" className="mb-6">
            <CardBody className="text-center py-8">
              <div className="text-5xl mb-2">&#127942;</div>
              <h2 className="text-accent text-2xl font-bold mb-1">
                {winner.team_name}
              </h2>
              <p className="text-text3 text-sm">
                CYBERHUNT Champion 2026
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <div className="text-center">
                  <div className="font-mono text-accent text-xl font-bold">
                    {winner.score}
                  </div>
                  <div className="text-text3 text-xs">Points</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-amber text-xl font-bold">
                    {winner.levels_solved}
                  </div>
                  <div className="text-text3 text-xs">Levels</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-blue text-xl font-bold">
                    {winner.total_hints}
                  </div>
                  <div className="text-text3 text-xs">Hints</div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Full Leaderboard */}
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[10px] font-semibold text-text3 uppercase tracking-wider py-3 px-3">#</th>
                    <th className="text-left text-[10px] font-semibold text-text3 uppercase tracking-wider py-3 px-3">Team</th>
                    <th className="text-right text-[10px] font-semibold text-text3 uppercase tracking-wider py-3 px-3">Score</th>
                    <th className="text-right text-[10px] font-semibold text-text3 uppercase tracking-wider py-3 px-3">Levels</th>
                    <th className="text-right text-[10px] font-semibold text-text3 uppercase tracking-wider py-3 px-3">Hints</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => (
                    <tr
                      key={t.team_id}
                      className={`border-b border-border/50 ${
                        t.is_winner ? "bg-accent/5" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <span className={`font-mono font-bold text-xs ${
                          t.rank === 1 ? "text-accent" : t.rank === 2 ? "text-blue" : t.rank === 3 ? "text-amber" : "text-text3"
                        }`}>
                          {t.rank}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-xs ${t.is_winner ? "text-accent font-bold" : "text-text2"}`}>
                          {t.team_name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-mono text-xs text-amber font-bold">{t.score}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-mono text-xs text-text2">{t.levels_solved}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-mono text-xs text-text3">{t.total_hints}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <div className="text-center mt-6">
          <Button
            variant="secondary"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
