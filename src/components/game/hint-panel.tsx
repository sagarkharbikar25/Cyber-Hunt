"use client";

import { useState } from "react";

interface Hint {
  num: number;
  text: string;
}

interface HintPanelProps {
  hints: Hint[];
  hintsUsed: number[];
  timeOnLevelS: number;
  onUseHint: (hintNum: number) => void;
}

export default function HintPanel({
  hints,
  hintsUsed,
  timeOnLevelS,
  onUseHint,
}: HintPanelProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const unlockTimes = [300, 600, 900];
  const penalties = [0, 10, 20, 30];

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(expanded === null ? 0 : null)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface2 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-amber" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          <span className="text-sm font-medium text-text2">Hints</span>
          <span className="text-xs text-text3">
            ({hintsUsed.length}/3 used)
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-text3 transition-transform ${
            expanded !== null ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded !== null && (
        <div className="border-t border-border p-4 space-y-3">
          {[1, 2, 3].map((num) => {
            const isUnlocked = timeOnLevelS >= unlockTimes[num - 1];
            const isUsed = hintsUsed.includes(num);
            const hint = hints.find((h) => h.num === num);
            const timeLeft = Math.max(0, unlockTimes[num - 1] - timeOnLevelS);

            return (
              <div
                key={num}
                className={`p-3 rounded-lg border transition-all ${
                  isUsed
                    ? "bg-accent/5 border-accent/20"
                    : isUnlocked
                    ? "bg-surface2 border-border hover:border-amber/30"
                    : "bg-surface2 border-border opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text2">
                    Hint {num}
                    {isUsed && (
                      <span className="ml-2 text-accent text-[10px]">
                        USED
                      </span>
                    )}
                  </span>
                  {!isUnlocked && !isUsed && (
                    <span className="text-[10px] text-text3 font-mono">
                      {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                    </span>
                  )}
                  {isUnlocked && !isUsed && (
                    <span className="text-[10px] text-amber">
                      -{penalties[num]} pts
                    </span>
                  )}
                </div>

                {isUsed && hint ? (
                  <p className="text-xs text-text2 italic">{hint.text}</p>
                ) : isUnlocked && !isUsed ? (
                  <button
                    onClick={() => onUseHint(num)}
                    className="text-xs text-amber hover:text-amber/80 font-medium cursor-pointer"
                  >
                    Click to reveal (-{penalties[num]} pts)
                  </button>
                ) : (
                  <p className="text-xs text-text3">
                    Unlocks in {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
