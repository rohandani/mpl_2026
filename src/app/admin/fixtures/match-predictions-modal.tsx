'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Fixture, MatchPrediction } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

interface MatchPredictionWithProfile extends MatchPrediction {
  profiles: { display_name: string | null } | null;
}

interface Props {
  fixture: Fixture;
  predictions: MatchPredictionWithProfile[];
  teams: Team[];
  players: Player[];
  onClose: () => void;
}

export function MatchPredictionsModal({ fixture, predictions, teams, players, onClose }: Props) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const playerMap = new Map(players.map((p) => [p.id, p]));
  const teamA = teamMap.get(fixture.team_a_id);
  const teamB = teamMap.get(fixture.team_b_id);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl shadow-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Match Predictions</h2>
            <p className="text-sm text-muted-foreground">
              {fixture.stage}: {teamA?.name} vs {teamB?.name}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {predictions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No predictions submitted for this match yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg ring-1 ring-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="py-2.5 pl-4 text-left font-medium text-muted-foreground">User</th>
                    <th className="py-2.5 text-left font-medium text-muted-foreground">Winner</th>
                    <th className="py-2.5 text-left font-medium text-muted-foreground">Man of Match</th>
                    <th className="py-2.5 text-left font-medium text-muted-foreground">Top Scorer</th>
                    <th className="py-2.5 pr-4 text-left font-medium text-muted-foreground">Top Bowler</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((prediction) => (
                    <tr key={prediction.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 pl-4 font-medium">
                        {prediction.profiles?.display_name || 'Unknown User'}
                      </td>
                      <td className="py-2.5">
                        {prediction.predicted_winner_id ? (
                          teamMap.get(prediction.predicted_winner_id)?.name || 'Unknown Team'
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        {prediction.predicted_mom_id ? (
                          playerMap.get(prediction.predicted_mom_id)?.name || 'Unknown Player'
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        {prediction.predicted_highest_scorer_id ? (
                          playerMap.get(prediction.predicted_highest_scorer_id)?.name || 'Unknown Player'
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4">
                        {prediction.predicted_highest_wicket_taker_id ? (
                          playerMap.get(prediction.predicted_highest_wicket_taker_id)?.name || 'Unknown Player'
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 border-t border-border">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}