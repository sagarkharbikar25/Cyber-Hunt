"use client";

import { useState } from "react";

interface Hint {
  num: number;
  text: string;
}

interface HintPanelProps {
  hints: Hint[];
  hintsUsed: number[];
  levelId: number;
  onUseHint: (hintNum: number) => void;
}

export default function HintPanel({
  hints,
  hintsUsed,
  levelId,
  onUseHint,
}: HintPanelProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const getTimePenalty = (lvl: number) => {
    if (lvl <= 3) return 4;
    if (lvl <= 6) return 5;
    return 6;
  };

  const getPointPenaltyStr = (num: number) => {
    return num === 1 ? "-20%" : "-30%";
  };

  const timePenalty = getTimePenalty(levelId);

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
            ({hintsUsed.length}/2 used)
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
          {[1, 2].map((num) => {
            const isUsed = hintsUsed.includes(num);
            const hint = hints.find((h) => h.num === num);

            return (
              <div
                key={num}
                className={`p-3 rounded-lg border transition-all ${
                  isUsed
                    ? "bg-accent/5 border-accent/20"
                    : "bg-surface2 border-border hover:border-amber/30"
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
                  {!isUsed && (
                    <span className="text-[10px] text-amber">
                      -{timePenalty}m & {getPointPenaltyStr(num)} pts
                    </span>
                  )}
                </div>

                {isUsed && hint ? (
                  <p className="text-xs text-text2 italic">{hint.text}</p>
                ) : (
                  <button
                    onClick={() => onUseHint(num)}
                    className="text-xs text-amber hover:text-amber/80 font-medium cursor-pointer"
                  >
                    Click to reveal (-{timePenalty}m time penalty)
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
