"use client";

interface LeaderboardEntry {
  rank: number;
  team_name: string;
  team_id: string;
  levels_solved: number;
}

export default function LeaderboardTable({
  teams,
  currentTeamId,
}: {
  teams: LeaderboardEntry[];
  currentTeamId?: string;
}) {
  if (teams.length === 0) {
    return (
      <div className="text-center py-8 text-text3 text-sm">
        No teams on the leaderboard yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-[10px] font-semibold text-text3 uppercase tracking-wider py-2 px-3">
              Rank
            </th>
            <th className="text-left text-[10px] font-semibold text-text3 uppercase tracking-wider py-2 px-3">
              Team
            </th>
            <th className="text-right text-[10px] font-semibold text-text3 uppercase tracking-wider py-2 px-3">
              Levels
            </th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => {
            const isCurrentTeam = t.team_id === currentTeamId;
            const rankColor =
              t.rank === 1
                ? "text-accent"
                : t.rank === 2
                ? "text-blue"
                : t.rank === 3
                ? "text-amber"
                : "text-text3";

            return (
              <tr
                key={t.team_id}
                className={`border-b border-border/50 transition-colors ${
                  isCurrentTeam ? "bg-accent/5" : "hover:bg-surface2"
                }`}
              >
                <td className="py-2.5 px-3">
                  <span
                    className={`font-mono font-bold text-xs ${rankColor}`}
                  >
                    {t.rank}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`text-xs ${
                      isCurrentTeam ? "text-accent font-medium" : "text-text2"
                    }`}
                  >
                    {t.team_name}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className="font-mono text-xs text-text2">
                    {t.levels_solved}/10
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
