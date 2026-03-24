'use client';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_points: number;
  predictions_count: number;
  correct_teams: number;
}

interface Props {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

const RANK_ICONS = ['🥇', '🥈', '🥉'];

export function LeaderboardTable({ entries, currentUserId }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-4xl">🏆</span>
        <div>
          <h1 className="text-2xl font-bold">
            Leader<span className="text-primary">board</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Ranked by total prediction score (price accuracy + team match)
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl ring-1 ring-border">
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-emerald-500 to-emerald-700" />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="w-14 py-3 pl-4 text-left font-medium text-muted-foreground">
                #
              </th>
              <th className="py-3 text-left font-medium text-muted-foreground">
                Player
              </th>
              <th className="py-3 text-center font-medium text-muted-foreground">
                Predictions
              </th>
              <th className="w-24 py-3 pr-4 text-right font-medium text-muted-foreground">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const isCurrentUser = entry.user_id === currentUserId;
              return (
                <tr
                  key={entry.user_id}
                  className={`border-b border-border last:border-0 transition-colors ${
                    isCurrentUser ? 'bg-amber-50' : 'hover:bg-muted/30'
                  }`}
                >
                  <td className="py-3 pl-4">
                    {i < 3 ? (
                      <span className="text-lg">{RANK_ICONS[i]}</span>
                    ) : (
                      <span className="text-muted-foreground">{i + 1}</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className={`font-semibold ${isCurrentUser ? 'text-foreground' : ''}`}>
                      {entry.display_name}
                    </span>
                  </td>
                  <td className="py-3 text-center text-muted-foreground">
                    {entry.predictions_count}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="font-bold text-primary">
                      {entry.total_points}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
