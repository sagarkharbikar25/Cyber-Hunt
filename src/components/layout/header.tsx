"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface GlobalHintState {
  global_hints_used: number;
  tokens_unlocked: number;
  tokens_available: number;
  max_global_hints: number;
  next_token_minutes: number;
}

function HintBar() {
  const [state, setState] = useState<GlobalHintState | null>(null);

  useEffect(() => {
    const fetchHints = async () => {
      try {
        const res = await fetch("/api/hints/global");
        if (res.ok) {
          setState(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch global hints", err);
      }
    };
    
    fetchHints();
    const interval = setInterval(fetchHints, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (!state) return <div className="flex gap-1 animate-pulse"><div className="h-4 w-24 bg-surface2"></div></div>;

  const renderTokens = () => {
    const tokens = [];
    for (let i = 0; i < state.max_global_hints; i++) {
      let status = "locked"; // Grayscale
      if (i < state.global_hints_used) {
        status = "used"; // Cracked/Red
      } else if (i < state.tokens_unlocked) {
        status = "available"; // Cyan Glow
      }

      tokens.push(
        <div
          key={i}
          className={`w-6 h-6 flex items-center justify-center border font-mono text-[10px] rounded-sm transition-all ${
            status === "available" 
              ? "border-blue text-blue shadow-[0_0_8px_rgba(0,212,255,0.4)]" 
              : status === "used"
              ? "border-red/40 text-red/40 line-through bg-red/5"
              : "border-border2 text-text3 opacity-50"
          }`}
          title={status === "available" ? "Hint Available!" : status === "used" ? "Hint Spent" : "Time Locked"}
        >
          {status === "used" ? "X" : i + 1}
        </div>
      );
    }
    return tokens;
  };

  return (
    <div className="flex items-center gap-3 bg-surface p-1.5 px-3 rounded-sm border border-border">
      <div className="text-[10px] text-text3 uppercase tracking-widest font-bold">
        Tokens
      </div>
      <div className="flex gap-1.5">
        {renderTokens()}
      </div>
      {state.tokens_unlocked < state.max_global_hints && (
        <div className="text-[9px] text-text2 font-mono ml-1">
          T-{Math.ceil(state.next_token_minutes)}M
        </div>
      )}
    </div>
  );
}

export default function Header({ teamName }: { teamName?: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur border-b border-border shadow-[0_4px_20px_rgba(0,255,136,0.05)]">
      <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
        <Link href="/dashboard" className="font-display text-lg font-bold group">
          <span className="text-text3 group-hover:text-white transition-colors">{"<"}</span>
          <span className="text-accent text-shadow-glitch animate-glitch inline-block">CYBERHUNT</span>
          <span className="text-text3 group-hover:text-white transition-colors">{" />"}</span>
        </Link>

        {teamName && <HintBar />}

        <div className="flex items-center gap-6">
          {teamName && (
            <span className="text-text2 text-xs font-mono uppercase tracking-widest hidden md:block">
              <span className="text-accent">AGENT:</span> {teamName}
            </span>
          )}
          <Link
            href="/leaderboard"
            className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-sm transition-all border ${
              pathname === "/leaderboard"
                ? "border-accent text-accent shadow-[0_0_10px_rgba(0,255,136,0.2)]"
                : "border-border2 text-text3 hover:text-accent hover:border-accent/50"
            }`}
          >
            SYS_BOARD
          </Link>
        </div>
      </div>
    </header>
  );
}
