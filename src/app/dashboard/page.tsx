"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tv, Puzzle, Lock, Unlock } from "lucide-react";

interface DashboardData {
  team: {
    id: string;
    name: string;
    current_level: number;
    hints_used: number;
    ai_strikes: number;
    score: number;
    fragments: string[];
    is_disqualified?: boolean;
    startedAt: number;
  };
  liveFeed: { id: string; time: string; text: string; }[];
  activeAgents: { id: string; name: string; level: number; status: string; }[];
  total_levels: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [fragments, setFragments] = useState<string[]>(Array(9).fill(""));
  const [submission, setSubmission] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hintWarning, setHintWarning] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [activeHintLink, setActiveHintLink] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState("90:00");
  const [isCritical, setIsCritical] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [selectedHintId, setSelectedHintId] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) {
        router.push("/");
        return;
      }
      const json = await res.json();
      if (json.error) {
        console.error("Dashboard API returned an error:", json.error, json.stack);
        return;
      }
      setData(json);
      if (loading && json.team) {
        setFragments(json.team.fragments);
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!data?.team?.startedAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - data.team.startedAt;
      const remaining = Math.max(0, 90 * 60 * 1000 - elapsed);
      
      const totalSeconds = Math.floor(remaining / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      setTimeLeft(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      setElapsedMinutes(Math.floor(elapsed / 60000));
      setIsCritical(totalSeconds < 300); // under 5 min
      setIsWarning(totalSeconds < 900 && totalSeconds >= 300); // under 15 min
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.team?.startedAt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission || !proofFile) return;
    setSubmitting(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(proofFile);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const base64Proof = canvas.toDataURL("image/jpeg", 0.6);

          const formData = new FormData();
          formData.append("action", "submit");
          formData.append("answer", submission);
          formData.append("proofBase64", base64Proof);

          const res = await fetch("/api/dashboard/action", { method: "POST", body: formData });
          const json = await res.json();
          if (json.success) {
            setSubmission("");
            setProofFile(null);
            alert(`✅ UPLOAD SUCCESSFUL!\n\nYour proof image was securely compressed and transmitted directly to Mission Control.\n\n${json.message}`);
          } else {
            alert("❌ TRANSMISSION ERROR: " + json.error);
          }
          setSubmitting(false);
        };
      };
    } catch (err) {
      console.error(err);
      alert("❌ CRITICAL FAILURE: Submission failed to transmit. Please try again.");
      setSubmitting(false);
    }
  };

  const handleHintClick = (hintId: number) => {
    setSelectedHintId(hintId);
    setHintWarning(true);
  };
  
  const confirmHint = async () => {
    setHintWarning(false);
    try {
      const formData = new FormData();
      formData.append("action", "hint");
      formData.append("hintId", data?.team.current_level.toString() || "1");
      const res = await fetch("/api/dashboard/action", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        setActiveHint(json.hint);
        setActiveHintLink(json.hintLink);
        fetchDashboardData();
      } else {
        alert("Error: " + json.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setActiveHint(null);
    setActiveHintLink(null);
  }, [data?.team?.current_level]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-bg0 flex items-center justify-center font-mono">
        <div className="text-[var(--color-neon)] text-xl tracking-widest animate-pulse">ESTABLISHING SECURE CONNECTION...</div>
      </div>
    );
  }

  const { team, activeAgents, total_levels } = data;

  const hintsConfig = [
    { id: 1, unlockMin: 10 },
    { id: 2, unlockMin: 20 },
    { id: 3, unlockMin: 30 },
    { id: 4, unlockMin: 40 },
    { id: 5, unlockMin: 50 },
    { id: 6, unlockMin: 60 },
  ];

  if (team?.is_disqualified) {
    return (
      <div className="min-h-screen bg-bg0 flex flex-col items-center justify-center font-mono p-6">
        <div className="bg-red/10 border-2 border-[var(--color-red)] rounded-xl p-12 max-w-2xl w-full text-center shadow-[0_0_50px_rgba(255,51,51,0.2)]">
          <svg className="w-24 h-24 text-[var(--color-red)] mx-auto mb-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <h1 className="text-4xl font-orb font-bold text-[var(--color-red)] tracking-widest mb-4">ACCESS DENIED</h1>
          <h2 className="text-xl text-white mb-6 uppercase tracking-widest">Team Disqualified</h2>
          <p className="text-[var(--color-text2)] mb-8">
            Your team has been permanently locked out of Mission Control due to excessive AI strikes or severe rule violations.
          </p>
          <button onClick={() => router.push("/")} className="bg-red/20 text-[var(--color-red)] border border-[var(--color-red)] hover:bg-[var(--color-red)] hover:text-black px-8 py-3 rounded tracking-widest uppercase transition-colors">
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  if (team?.current_level > total_levels) {
    return (
      <div className="min-h-screen bg-bg0 flex flex-col items-center justify-center font-mono p-6">
        <div className="bg-[var(--color-neon)]/10 border-2 border-[var(--color-neon)] rounded-xl p-12 max-w-2xl w-full text-center shadow-[0_0_50px_rgba(0,255,136,0.2)]">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-4xl font-orb font-bold text-[var(--color-neon)] tracking-widest mb-4 drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]">MISSION ACCOMPLISHED</h1>
          <h2 className="text-xl text-white mb-6 uppercase tracking-widest">All Fragments Secured</h2>
          <div className="bg-bg1 border border-[var(--color-border-g2)] p-6 rounded mb-8">
            <div className="text-[var(--color-text2)] text-xs mb-2 tracking-widest uppercase">Decrypted Flag</div>
            <div className="text-3xl text-white font-bold tracking-widest">{team.fragments.join("")}</div>
          </div>
          <p className="text-[var(--color-text2)] mb-8">
            Excellent work, Agent. You have successfully recovered all Intel and completed Operation Vault. Your final time and score have been recorded.
          </p>
          <button onClick={() => router.push("/leaderboard")} className="bg-[var(--color-neon)]/20 text-[var(--color-neon)] border border-[var(--color-neon)] hover:bg-[var(--color-neon)] hover:text-black px-8 py-3 rounded tracking-widest uppercase transition-colors">
            View Global Rankings
          </button>
        </div>
      </div>
    );
  }

  const securedFragmentsCount = fragments.filter(f => f !== "").length;
  const progressPercent = Math.round((team.current_level / total_levels) * 100);

  return (
    <div className="min-h-screen bg-bg0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,255,136,0.05)_0%,transparent_60%)] flex flex-col">
      
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-6 h-12 bg-bg1 border-b border-border-g2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-neon animate-pulse"></div>
          <span className="font-orb text-[13px] font-bold tracking-[3px] text-neon">OPERATION VAULT</span>
        </div>
        <div className="flex items-center gap-5 font-mono text-[11px]">
          <span className="text-text2">AGENT:</span>
          <span className="text-neon font-bold tracking-[2px]">{team?.name || "UNKNOWN"}</span>
          <button 
            onClick={() => router.push("/")}
            className="border border-red text-red px-3 py-[3px] font-orb text-[10px] tracking-[2px] uppercase transition-colors hover:bg-red hover:text-black"
          >
            DISCONNECT
          </button>
        </div>
      </div>

      {/* TIMER HERO */}
      <div className="bg-bg1 border-b border-border-g2 pt-5 pb-[18px] px-6 flex items-center justify-center gap-20 relative shadow-[0_4px_20px_rgba(0,0,0,0.5)] shrink-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/5 h-px bg-neon shadow-[0_0_12px_rgba(0,255,136,1)]"></div>
        
        <div className="flex gap-10">
          <div className="text-center">
            <div className="font-mono text-[32px] font-bold leading-none text-neon">{team?.hints_used || 0}</div>
            <div className="font-orb text-[8px] tracking-[3px] text-text2 mt-1">HINTS USED</div>
          </div>
          <div className="w-px h-[60px] bg-border-g2"></div>
          <div className="text-center">
            <div className="font-mono text-[32px] font-bold leading-none text-amber">{team?.ai_strikes || 0}</div>
            <div className="font-orb text-[8px] tracking-[3px] text-text2 mt-1">AI STRIKES</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-[32px] font-bold leading-none text-red">/ 3</div>
            <div className="font-orb text-[8px] tracking-[3px] text-text2 mt-1">MAX STRIKES</div>
          </div>
        </div>

        <div className="w-px h-[60px] bg-border-g2"></div>

        <div className="text-center">
          <div className={`font-mono text-[72px] font-bold tracking-[4px] leading-none drop-shadow-[0_0_20px_rgba(0,255,136,0.6)] ${isCritical ? 'text-red drop-shadow-[0_0_20px_rgba(255,51,51,0.6)] animate-blink' : isWarning ? 'text-amber drop-shadow-[0_0_20px_rgba(255,170,0,0.6)]' : 'text-neon'}`}>
            {timeLeft}
          </div>
          <div className="font-orb text-[9px] tracking-[4px] text-text2 mt-1">TIME REMAINING</div>
        </div>

        <div className="w-px h-[60px] bg-border-g2"></div>

        <div className="flex gap-10">
          <div className="text-center">
            <div className="font-mono text-[32px] font-bold leading-none text-neon">{team?.current_level || 1}</div>
            <div className="font-orb text-[8px] tracking-[3px] text-text2 mt-1">MISSION</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-[32px] font-bold leading-none text-text2">/ {total_levels}</div>
            <div className="font-orb text-[8px] tracking-[3px] text-text2 mt-1">TOTAL</div>
          </div>
          <div className="w-px h-[60px] bg-border-g2"></div>
          <div className="text-center">
            <div className="font-mono text-[32px] font-bold leading-none text-neon">{securedFragmentsCount}</div>
            <div className="font-orb text-[8px] tracking-[3px] text-text2 mt-1">FRAGS</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-[32px] font-bold leading-none text-text2">/ 9</div>
            <div className="font-orb text-[8px] tracking-[3px] text-text2 mt-1">SECURED</div>
          </div>
        </div>
      </div>

      {/* MAIN 3-COL GRID */}
      <div className="grid grid-cols-[280px_1fr_280px] min-h-0 flex-1 overflow-hidden">
        
        {/* LEFT: LIVE SCOREBOARD */}
        <div className="bg-bg1 border-r border-border-g2 flex flex-col overflow-hidden">
          <div className="p-[14px_18px_10px] border-b border-border-g2 flex items-center gap-2 shrink-0">
            <Tv size={14} className="text-neon" />
            <span className="font-orb text-[9px] tracking-[3px] text-neon uppercase">LIVE SCOREBOARD</span>
          </div>
          
          <div className="grid grid-cols-[1fr_60px_70px] p-[8px_18px] font-orb text-[8px] tracking-[2px] text-text2 border-b border-border-g shrink-0">
            <div>TEAM</div>
            <div className="text-center">RANK</div>
            <div className="text-right">SCORE</div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!activeAgents || activeAgents.length === 0 ? (
              <div className="p-4 text-center text-text2 text-xs">No agents active.</div>
            ) : (
              activeAgents.map((agent: any, i: number) => {
                const isSelf = agent.id === team.id;
                const pips = Array.from({ length: 10 });
                return (
                  <div key={agent.id} className={`grid grid-cols-[1fr_60px_70px] p-[10px_18px] border-b border-border-g items-center hover:bg-bg2 transition-colors cursor-pointer ${isSelf ? 'bg-[rgba(0,255,136,0.05)]' : ''}`}>
                    <div className="overflow-hidden">
                      <div className={`font-raj text-[13px] font-semibold tracking-[1px] truncate ${isSelf ? 'text-neon' : i === 0 ? 'text-amber' : 'text-text'}`}>
                        {agent.name}
                      </div>
                      <div className="flex gap-[3px] mt-[3px]">
                        {pips.map((_, idx) => (
                          <div 
                            key={idx} 
                            className={`w-[6px] h-[6px] rounded-[1px] ${idx < agent.level ? (i === 0 ? 'bg-amber' : 'bg-neon') : 'bg-border-g2'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className={`font-mono text-[10px] w-[22px] h-[22px] rounded-[2px] flex items-center justify-center 
                        ${i === 0 ? 'bg-[#ffaa0022] text-amber border border-[#ffaa0044]' : 
                          i === 1 ? 'bg-[#c0c0c022] text-[#c0c0c0] border border-[#c0c0c044]' : 
                          i === 2 ? 'bg-[#cd7f3222] text-[#cd7f32] border border-[#cd7f3244]' : 
                          'bg-bg3 text-text2'}`}>
                        {i + 1}
                      </div>
                    </div>
                    <div className={`font-mono text-[13px] text-right ${isSelf || i === 0 ? 'text-amber' : 'text-neon'}`}>
                      {agent.level} / 10
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="p-[12px_18px] border-t border-border-g shrink-0 mt-auto">
            <div className="flex justify-between font-mono text-[10px] text-text2 mb-[6px]">
              <span>YOUR PROGRESS</span>
              <span className="text-neon">{progressPercent}%</span>
            </div>
            <div className="h-[3px] bg-bg3">
              <div className="h-full bg-neon transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* CENTER: MISSION */}
        <div className="bg-bg0 p-5 flex flex-col gap-4 overflow-y-auto">
          
          <div className="flex justify-between items-center pb-[14px] border-b border-border-g2">
            <div className="flex items-baseline gap-2.5">
              <div className="font-orb text-[18px] font-black text-white tracking-[2px]">
                MISSION <span className="text-neon">{team?.current_level || 1}</span>
              </div>
              <div className="font-mono text-[12px] text-text2">OF {total_levels}</div>
            </div>
            <div className="font-orb text-[9px] tracking-[3px] p-[5px_14px] border border-neon text-neon bg-[rgba(0,255,136,0.06)]">
              ● ACTIVE
            </div>
          </div>

          <div className="bg-bg2 border border-border-g2 border-l-4 border-l-neon p-[16px_20px]">
            <div className="font-orb text-[13px] font-bold text-neon tracking-[3px] mb-2.5">THE GAME BEGINS</div>
            <div className="font-raj text-[14px] leading-[1.6] text-text font-medium">
              Your target is the TechAlfa public repository. Find the initial breach point and extract the embedded cipher key or flag. You must submit your proof image.
            </div>
            <a href="https://github.com/techalfatechnician-ngp/CyberHunt.git" target="_blank" className="inline-block mt-3 font-mono text-[12px] text-neon no-underline border-b border-[#00ff8844] pb-px tracking-[0.5px] transition-colors hover:border-neon flex items-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              HTTPS://GITHUB.COM/TECHALFATECHNICIAN-NGP/CYBERHUNT.GIT
            </a>
          </div>

          <div className="font-orb text-[9px] tracking-[4px] text-text2 text-center p-[4px_0] mt-2">
            ─── ENCRYPTED INTEL VAULT ───
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {hintsConfig.map((hint) => {
              const isLocked = elapsedMinutes < hint.unlockMin;
              return (
                <div 
                  key={hint.id}
                  onClick={() => !isLocked && handleHintClick(hint.id)}
                  className={`border p-[14px_16px] text-center relative transition-all duration-200
                    ${isLocked 
                      ? 'bg-bg2 border-border-g cursor-not-allowed opacity-60 hover:bg-bg3' 
                      : 'bg-[#ffaa0010] border-amber cursor-pointer hover:bg-[#ffaa0020]'}`}
                >
                  {isLocked ? <Lock size={12} className="absolute top-2 right-2 text-text2 opacity-30" /> : <Unlock size={12} className="absolute top-2 right-2 text-amber" />}
                  <div className={`font-orb text-[11px] font-bold tracking-[3px] mb-1 ${isLocked ? 'text-text2' : 'text-amber'}`}>
                    HINT {hint.id}
                  </div>
                  <div className={`font-mono text-[10px] ${isLocked ? 'text-text2 opacity-50' : 'text-[#ffaa0099]'}`}>
                    {isLocked ? `UNLOCKS IN ${hint.unlockMin - elapsedMinutes}M` : 'READY TO DECRYPT'}
                  </div>
                </div>
              );
            })}
          </div>

          {hintWarning && !activeHint && (
            <div className="bg-[#ffaa0010] border border-amber p-4 mt-2">
              <h4 className="font-orb text-[11px] text-amber font-bold mb-2 tracking-[2px]">WARNING: SCORE PENALTY</h4>
              <p className="text-text2 text-xs mb-4 font-raj">Decrypting this hint will permanently reduce your final score. Are you sure you want to proceed?</p>
              <div className="flex gap-3">
                <button onClick={confirmHint} className="bg-amber text-black px-4 py-2 text-[10px] font-orb font-bold tracking-[2px] hover:bg-[#ffbb33]">CONFIRM</button>
                <button onClick={() => setHintWarning(false)} className="border border-border-g2 text-text2 hover:text-white px-4 py-2 text-[10px] font-orb font-bold tracking-[2px]">CANCEL</button>
              </div>
            </div>
          )}

          {activeHint && (
            <div className="bg-[rgba(0,255,136,0.1)] border border-neon p-6 w-full flex flex-col items-center text-center mt-2">
              <h4 className="font-orb text-[11px] text-neon font-bold mb-4 tracking-[3px]">DECRYPTED INTEL:</h4>
              <p className="text-white text-base mb-6 leading-relaxed font-raj">{activeHint}</p>
              {activeHintLink && (
                <a 
                  href={activeHintLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-neon text-black px-6 py-2.5 font-orb font-bold tracking-[2px] text-[10px] hover:bg-[#00ffaa] hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all"
                >
                  FOLLOW LEAD
                </a>
              )}
            </div>
          )}

          <div className="mt-auto pt-4">
            <div className="font-orb text-[9px] tracking-[4px] text-text2 text-center p-[4px_0] mb-2">
              ─── TRANSMIT SOLUTION ───
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2.5 items-stretch bg-bg2 p-3 border border-border-g2">
              <input
                type="text"
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                required
                placeholder="ENTER SECURED FRAGMENT..."
                className="flex-1 bg-bg3 border border-border-g2 text-neon font-mono text-[14px] p-[10px_16px] outline-none tracking-[1px] placeholder:text-text2 placeholder:opacity-50 focus:border-neon transition-colors uppercase"
              />
              <div className="relative flex items-center justify-center border border-dashed border-border-g2 bg-bg3 px-4 hover:border-neon transition-colors group cursor-pointer overflow-hidden min-w-[140px]">
                <input 
                  type="file" 
                  required 
                  accept="image/png, image/jpeg"
                  onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                />
                <div className="flex flex-col items-center justify-center z-0 pointer-events-none">
                  <span className="font-orb text-[9px] tracking-[2px] text-text2 group-hover:text-white transition-colors">
                    {proofFile ? proofFile.name.substring(0, 15) + (proofFile.name.length > 15 ? '...' : '') : 'UPLOAD PROOF'}
                  </span>
                  <span className="font-mono text-[8px] text-text2 opacity-50 mt-1">{proofFile ? 'READY' : 'JPG / PNG'}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-neon text-black border-none font-orb text-[10px] font-bold tracking-[2px] p-[0_20px] cursor-pointer transition-colors hover:bg-[#00ffaa] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {submitting ? "TRANSMITTING..." : "SUBMIT"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: FRAGMENTS */}
        <div className="bg-bg1 border-l border-border-g2 flex flex-col overflow-hidden">
          <div className="p-[14px_18px_10px] border-b border-border-g2 flex items-center gap-2 shrink-0">
            <Puzzle size={14} className="text-neon" />
            <span className="font-orb text-[9px] tracking-[3px] text-neon uppercase">SECURED FRAGMENTS</span>
          </div>
          
          <div className="p-[10px_18px_6px] flex items-center justify-between shrink-0">
            <span className="font-orb text-[8px] tracking-[2px] text-text2">VAULT KEYS</span>
            <span className="font-mono text-[11px] text-neon">{securedFragmentsCount} / 9</span>
          </div>

          <div className="grid grid-cols-3 gap-2 p-[0_16px_16px] shrink-0">
            {fragments.map((frag, idx) => {
              const isSecured = frag !== "";
              return (
                <div key={idx} className={`aspect-square bg-bg2 border flex flex-col items-center justify-center relative transition-all duration-200 cursor-default ${isSecured ? 'border-neon bg-[rgba(0,255,136,0.05)]' : 'border-border-g'}`}>
                  <span className="absolute top-[5px] left-[7px] font-mono text-[8px] text-text2 opacity-60">L{idx + 1}</span>
                  {!isSecured ? (
                    <span className="font-mono text-[18px] text-border-g2">?</span>
                  ) : (
                    <Unlock size={20} className="text-neon" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-[0_16px_10px] flex-1 overflow-y-auto">
            <div className="font-mono text-[9px] text-text2 tracking-[2px] mb-2">FRAGMENT STATUS</div>
            <div className="grid gap-[5px]">
              {fragments.map((frag, idx) => {
                const isSecured = frag !== "";
                return (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-[#00ff8811]">
                    <span className={`font-mono text-[10px] ${isSecured ? 'text-neon' : 'text-text2'}`}>L{idx + 1}</span>
                    <span className={`font-mono text-[9px] ${isSecured ? 'text-neon' : 'text-text2 opacity-40'}`}>
                      {isSecured ? '● SECURED' : '○ PENDING'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
