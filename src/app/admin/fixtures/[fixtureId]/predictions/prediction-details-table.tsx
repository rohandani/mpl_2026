'use client';

import type { MatchPrediction } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

interface MatchPredictionWithProfile extends MatchPrediction {
  profiles: { display_name: string | null } | null;
}

interface Props {
  predictions: MatchPredictionWithProfile[];
  teams: Team[];
  players: Player[];
}

export function PredictionDetailsTable({ predictions, teams, players }: Props) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const playerMap = new Map(players.map((p) => [p.id, p]));

  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="py-3 pl-6 text-left font-medium text-muted-foreground">User</th>
            <th className="py-3 text-left font-medium text-muted-foreground">Winner</th>
            <th className="py-3 text-left font-medium text-muted-foreground">Man of Match</th>
            <th className="py-3 text-left font-medium text-muted-foreground">Top Scorer</th>
            <th className="py-3 pr-6 text-left font-medium text-muted-foreground">Top Bowler</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((prediction) => (
            <tr key={prediction.id} className="border-b border-border last:border-0 hover:bg-muted/20">
              <td className="py-3 pl-6 font-medium">
                {prediction.profiles?.display_name || 'Unknown User'}
              </td>
              <td className="py-3">
                {prediction.predicted_winner_id ? (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {teamMap.get(prediction.predicted_winner_id)?.name || 'Unknown Team'}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="py-3">
                {prediction.predicted_mom_id ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                    {playerMap.get(prediction.predicted_mom_id)?.name || 'Unknown Player'}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="py-3">
                {prediction.predicted_highest_scorer_id ? (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                    {playerMap.get(prediction.predicted_highest_scorer_id)?.name || 'Unknown Player'}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="py-3 pr-6">
                {prediction.predicted_highest_wicket_taker_id ? (
                  <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/20 dark:text-violet-400">
                    {playerMap.get(prediction.predicted_highest_wicket_taker_id)?.name || 'Unknown Player'}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}