"use client";

export default function LevelProgress({
  currentLevel,
  levelsSolved,
}: {
  currentLevel: number;
  levelsSolved: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text3 font-medium uppercase tracking-wider">
          Mission Progress
        </span>
        <span className="text-xs text-text2 font-mono">
          {levelsSolved}/10
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => {
          const level = i + 1;
          const isSolved = level <= levelsSolved;
          const isCurrent = level === currentLevel;

          return (
            <div
              key={level}
              className={`flex-1 h-2 rounded-full transition-all ${
                isSolved
                  ? "bg-accent"
                  : isCurrent
                  ? "bg-accent/30 animate-pulse"
                  : "bg-surface2"
              }`}
              title={`Level ${level}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-text3">L1</span>
        <span className="text-[10px] text-text3">L5</span>
        <span className="text-[10px] text-text3">L10</span>
      </div>
    </div>
  );
}
