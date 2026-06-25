"use client";

import { Fragment } from "@/types";

export default function FragmentInventory({
  fragments,
}: {
  fragments: Fragment[];
}) {
  const allFragments = Array.from({ length: 9 }, (_, i) => {
    const f = fragments.find((fr) => fr.level_id === i + 1);
    return { level: i + 1, value: f?.value || null, collected: !!f };
  });

  return (
    <div>
      <h3 className="text-xs font-semibold text-text3 uppercase tracking-wider mb-3">
        Collected Fragments
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {allFragments.map((f) => (
          <div
            key={f.level}
            className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
              f.collected
                ? "bg-accent/5 border-accent/30"
                : "bg-surface2 border-border"
            }`}
          >
            <span className="text-[10px] text-text3 font-mono">
              L{f.level}
            </span>
            <span
              className={`font-mono text-sm font-bold mt-0.5 ${
                f.collected ? "text-accent" : "text-text3/30"
              }`}
            >
              {f.collected ? f.value : "??"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-center">
        <span className="text-text3 text-xs">
          {fragments.length}/9 fragments
        </span>
      </div>
    </div>
  );
}
