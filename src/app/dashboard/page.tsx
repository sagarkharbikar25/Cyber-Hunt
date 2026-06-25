"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import CountdownTimer from "@/components/game/countdown-timer";
import FragmentInventory from "@/components/game/fragment-inventory";
import LevelProgress from "@/components/game/level-progress";
import LeaderboardTable from "@/components/game/leaderboard-table";
import Card, { CardHeader, CardBody } from "@/components/ui/card";
import Button from "@/components/ui/button";
import type { DashboardData, LeaderboardEntry } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const json = await res.json();
      setLeaderboard(json.teams || []);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard, fetchLeaderboard]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-accent font-mono text-sm animate-pulse">
          Loading mission control...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-red font-mono text-sm">Failed to load dashboard</div>
      </div>
    );
  }

  const handleStartLevel = () => {
    router.push(`/play/${data.current_level}`);
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header teamName={data.team_name} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Timer + Status Bar */}
        <div className="mb-6">
          <Card>
            <CardBody className="py-6">
              <CountdownTimer
                totalSeconds={data.time_remaining_s}
                eventStatus={data.event_status}
              />
            </CardBody>
          </Card>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                data.event_status === "active"
                  ? "bg-accent animate-pulse"
                  : data.event_status === "paused"
                  ? "bg-amber"
                  : data.event_status === "ended"
                  ? "bg-red"
                  : "bg-text3"
              }`}
            />
            <span className="text-xs text-text2 font-medium capitalize">
              {data.event_status === "not_started"
                ? "Standby"
                : data.event_status}
            </span>
          </div>
          <div className="bg-surface border border-border rounded-lg px-3 py-1.5">
            <span className="text-xs text-text3">Rank </span>
            <span className="text-xs text-accent font-mono font-bold">
              #{data.rank}
            </span>
          </div>
          <div className="bg-surface border border-border rounded-lg px-3 py-1.5">
            <span className="text-xs text-text3">Score </span>
            <span className="text-xs text-amber font-mono font-bold">
              {data.score}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Current Mission */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text">
                    Mission {data.current_level} of 10
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      data.event_status === "active"
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : data.event_status === "paused"
                        ? "bg-amber/10 text-amber border border-amber/20"
                        : "bg-text3/10 text-text3 border border-border"
                    }`}
                  >
                    {data.event_status === "active"
                      ? "ACTIVE"
                      : data.event_status === "paused"
                      ? "PAUSED"
                      : "LOCKED"}
                  </span>
                </div>
              </CardHeader>
              <CardBody>
                <LevelProgress
                  currentLevel={data.current_level}
                  levelsSolved={data.levels_solved}
                />
                {data.event_status === "active" && (
                  <div className="mt-4">
                    <Button
                      onClick={handleStartLevel}
                      className="w-full"
                      size="lg"
                    >
                      {data.levels_solved === 0
                        ? "Begin Mission"
                        : `Continue to Level ${data.current_level}`}
                    </Button>
                  </div>
                )}
                {data.event_status === "paused" && (
                  <div className="mt-4 text-center">
                    <p className="text-amber text-sm">
                      Event is paused. Waiting for admin to resume.
                    </p>
                  </div>
                )}
                {data.event_status === "ended" && (
                  <div className="mt-4 text-center">
                    <p className="text-red text-sm">
                      Mission time has ended.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <span className="text-sm font-semibold text-text">
                  Live Leaderboard
                </span>
              </CardHeader>
              <CardBody className="p-0">
                <LeaderboardTable
                  teams={leaderboard}
                  currentTeamId={data.team_id}
                />
              </CardBody>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Fragments */}
            <Card>
              <CardBody>
                <FragmentInventory fragments={data.fragments} />
              </CardBody>
            </Card>

            {/* Team Info */}
            <Card>
    <div className="min-h-screen bg-bg bg-grid-pattern font-mono text-sm pb-12">
      
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-surface/80 backdrop-blur-md border-b border-surface2 sticky top-0 z-50">
        <div className="font-display font-bold text-lg text-white tracking-widest flex items-center gap-2">
          <span className="text-accent text-glow">O</span>OPERATION VAULT
        </div>
        <div className="flex items-center gap-6">
          <div className="text-text2">
            AGENT: <span className="text-accent font-bold tracking-widest">{MOCK_TEAM.name}</span>
          </div>
          <button className="text-red hover:text-white border border-red/30 hover:border-red px-3 py-1 rounded transition-colors text-xs tracking-widest uppercase">
            Disconnect
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 mt-8">
        
        {/* Top Hero Bar (Timer & Strike Status) */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-1 bg-surface border border-surface2 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
            <div className="text-5xl font-display font-bold text-accent text-glow mb-2">90:00:00</div>
            <div className="text-text3 text-xs tracking-widest uppercase font-bold">Time Remaining</div>
          </div>
          <div className="bg-surface border border-surface2 rounded-xl p-6 shadow-lg flex items-center justify-center gap-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber mb-1">{MOCK_TEAM.hints_used}</div>
              <div className="text-text3 text-[10px] tracking-widest uppercase">Hints Used</div>
            </div>
            <div className="w-px h-12 bg-surface2"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red mb-1">{MOCK_TEAM.ai_strikes} / 3</div>
              <div className="text-text3 text-[10px] tracking-widest uppercase">AI Strikes</div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Team Hub) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Mission Control */}
            <div className="bg-surface border border-surface2 rounded-xl p-6 shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 border-b border-surface2 pb-4">
                <h2 className="text-xl font-display font-bold text-white tracking-widest">
                  MISSION {MOCK_TEAM.current_level} <span className="text-text3">OF {MOCK_LEVELS}</span>
                </h2>
                <span className="bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded text-xs font-bold tracking-widest">ACTIVE</span>
              </div>
              
              {MOCK_TEAM.current_level === 1 ? (
                <div className="mb-6 bg-accent/5 border border-accent/20 rounded-lg p-5">
                  <h3 className="text-accent font-bold mb-2 uppercase tracking-widest text-lg">The Game Begins</h3>
                  <p className="text-text2 leading-relaxed mb-4">Your first target is the TechAlfa public repository. Find the initial breach point.</p>
                  <a href="https://github.com/techalfatechnician-ngp/CyberHunt.git" target="_blank" className="text-blue underline underline-offset-4 decoration-blue/30 hover:text-white transition-colors">
                    https://github.com/techalfatechnician-ngp/CyberHunt.git
                  </a>
                </div>
              ) : (
                <div className="mb-6 flex justify-between items-center bg-surface2/50 rounded-lg p-5 border border-surface2">
                  <span className="text-text2">Need intel? Request a hint.</span>
                  <button onClick={handleHintClick} className="bg-amber/10 text-amber hover:bg-amber hover:text-bg border border-amber/30 px-4 py-2 rounded font-bold uppercase tracking-widest transition-all">
                    Decrypt Hint
                  </button>
                </div>
              )}

              {hintWarning && (
                <div className="mb-6 bg-amber/10 border border-amber p-4 rounded-lg">
                  <h4 className="text-amber font-bold mb-2">WARNING: SCORE PENALTY</h4>
                  <p className="text-text2 text-xs mb-4">Decrypting this hint will permanently reduce your final score. Are you sure you want to proceed?</p>
                  <div className="flex gap-3">
                    <button onClick={confirmHint} className="bg-amber text-bg px-4 py-2 rounded text-xs font-bold uppercase">Confirm</button>
                    <button onClick={() => setHintWarning(false)} className="bg-surface2 text-text2 hover:text-white px-4 py-2 rounded text-xs font-bold uppercase">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Submission Hub */}
            <div className="bg-surface border border-border/40 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,136,0.05)] relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <h3 className="text-accent font-bold tracking-widest uppercase mb-4 text-xs">Execute Submission</h3>
              <form onSubmit={handleSubmission} className="flex flex-col gap-4">
                <div>
                  <input
                    type="text"
                    value={submission}
                    onChange={(e) => setSubmission(e.target.value)}
                    required
                    placeholder="ENTER DECRYPTED FLAG..."
                    className="w-full bg-surface2/50 border border-border/20 rounded-lg px-4 py-3 text-white placeholder-text3 focus:outline-none focus:border-accent transition-colors font-mono text-sm"
                  />
                </div>
                <div className="flex items-center justify-between border border-dashed border-surface2 rounded-lg p-4 bg-bg/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-surface2 flex items-center justify-center text-text3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <div>
                      <div className="text-text2 font-bold text-xs">UPLOAD PROOF</div>
                      <div className="text-text3 text-[10px]">PNG, JPG (Max 5MB)</div>
                    </div>
                  </div>
                  <input type="file" required className="text-xs text-text3 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-surface2 file:text-white hover:file:bg-surface3 cursor-pointer" />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-accent text-bg font-bold tracking-widest uppercase py-4 rounded-lg mt-2 hover:bg-[#00e67a] hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all"
                >
                  {submitting ? "VERIFYING..." : "SUBMIT INTEL"}
                </button>
              </form>
            </div>

            {/* Editable Fragment Inventory */}
            <div className="bg-surface border border-surface2 rounded-xl p-6 shadow-lg">
              <h3 className="text-text2 font-bold tracking-widest uppercase mb-4 text-xs">Collected Fragments (Notepad)</h3>
              <div className="grid grid-cols-3 gap-3">
                {fragments.map((frag, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -top-2 -left-2 text-[10px] text-text3 font-bold bg-surface px-1">L{idx + 1}</div>
                    <input
                      type="text"
                      maxLength={1}
                      value={frag}
                      onChange={(e) => handleFragmentChange(idx, e.target.value)}
                      placeholder="?"
                      className="w-full aspect-square bg-bg border border-surface2 rounded-lg text-center text-3xl font-bold text-white placeholder-text3/30 focus:border-accent focus:bg-accent/5 focus:outline-none transition-all uppercase"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (Live Feed & Status) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Live Feed */}
            <div className="bg-surface border border-surface2 rounded-xl p-0 shadow-lg overflow-hidden flex flex-col h-[400px]">
              <div className="p-4 border-b border-surface2 bg-surface2/20">
                <h3 className="text-text2 font-bold tracking-widest uppercase text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                  Live Network Feed
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {MOCK_LIVE_FEED.map((feed) => (
                  <div key={feed.id} className="bg-bg/50 border border-surface2 rounded p-3 flex gap-4 items-start">
                    <div className="text-accent text-[10px] mt-0.5">{feed.time}</div>
                    <div className="text-text2 text-xs">{feed.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Teams Status */}
            <div className="bg-surface border border-surface2 rounded-xl p-0 shadow-lg overflow-hidden flex flex-col h-[450px]">
              <div className="p-4 border-b border-surface2 bg-surface2/20">
                <h3 className="text-text2 font-bold tracking-widest uppercase text-xs flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Active Agents
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-left text-xs">
                  <thead className="text-text3 bg-bg/50 border-b border-surface2">
                    <tr>
                      <th className="font-medium p-4 tracking-widest">TEAM</th>
                      <th className="font-medium p-4 tracking-widest">LEVEL</th>
                      <th className="font-medium p-4 tracking-widest">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface2">
                    {MOCK_ALL_TEAMS.map((team) => (
                      <tr key={team.id} className="hover:bg-surface2/30 transition-colors">
                        <td className="p-4">
                          <div className="text-white font-bold">{team.name}</div>
                          <div className="text-text3 text-[10px] mt-1">{team.id}</div>
                        </td>
                        <td className="p-4 text-accent font-bold">LVL {team.level}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] tracking-widest uppercase font-bold border ${team.status === 'Active' ? 'border-accent/30 text-accent bg-accent/5' : 'border-amber/30 text-amber bg-amber/5'}`}>
                            {team.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
