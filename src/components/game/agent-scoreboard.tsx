import React from "react";

interface Agent {
  id: string;
  name: string;
  level: number;
  status: string;
}

interface AgentScoreboardProps {
  activeAgents: Agent[] | null;
  currentTeamId: string;
}

export default function AgentScoreboard({
  activeAgents,
  currentTeamId,
}: AgentScoreboardProps) {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-bg0 max-h-[40vh]">
      {!activeAgents || activeAgents.length === 0 ? (
        <div className="p-4 text-center text-text2 text-xs font-mono tracking-widest">
          NO SIGNALS DETECTED
        </div>
      ) : (
        activeAgents.map((agent, i) => {
          const isSelf = agent.id === currentTeamId;
          const pips = Array.from({ length: 10 });
          return (
            <div
              key={agent.id}
              className={`p-[10px_14px] border-b border-border-g flex items-center justify-between hover:bg-bg2 transition-colors cursor-pointer ${
                isSelf ? "bg-[rgba(0,255,136,0.05)] border-l-2 border-l-neon" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`font-mono text-[10px] w-5 h-5 rounded-[2px] flex items-center justify-center font-bold
                    ${
                      i === 0
                        ? "bg-[#ffaa0022] text-amber border border-[#ffaa0044]"
                        : i === 1
                        ? "bg-[#c0c0c022] text-[#c0c0c0] border border-[#c0c0c044]"
                        : i === 2
                        ? "bg-[#cd7f3222] text-[#cd7f32] border border-[#cd7f3244]"
                        : "bg-bg3 text-text2"
                    }`}
                >
                  {(i + 1).toString().padStart(2, "0")}
                </div>
                <div className="overflow-hidden">
                  <div
                    className={`font-raj text-[13px] font-bold tracking-[1px] truncate max-w-[120px] ${
                      isSelf ? "text-neon" : i === 0 ? "text-amber" : "text-text"
                    }`}
                  >
                    {agent.name}
                  </div>
                  <div className="flex gap-[2px] mt-[3px]">
                    {pips.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-[5px] h-[5px] rounded-sm ${
                          idx < agent.level
                            ? i === 0
                              ? "bg-amber"
                              : "bg-neon"
                            : "bg-border-g2"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div
                className={`font-mono text-[11px] font-bold ${
                  isSelf || i === 0 ? "text-amber" : "text-neon"
                }`}
              >
                {agent.level}/10
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
