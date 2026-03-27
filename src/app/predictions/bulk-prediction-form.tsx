'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { submitBulkPredictions } from './actions';
import type { PlayerWithPrediction } from '@/types/prediction';
import type { Team } from '@/types/team';

interface TeamWithCaptain extends Team {
  captain_name: string | null;
}

interface Props {
  players: PlayerWithPrediction[];
  teams: TeamWithCaptain[];
}

interface BulkEntry {
  playerId: string;
  price: number;
  teamId: string;
}

export function BulkPredictionForm({ players, teams }: Props) {
  const eligible = players.filter(
    (p) => p.auction?.sold_price == null
  );

  const [entries, setEntries] = useState<Record<string, BulkEntry>>(() => {
    const init: Record<string, BulkEntry> = {};
    for (const p of eligible) {
      init[p.id] = {
        playerId: p.id,
        price: p.prediction?.predicted_price ?? p.base_price,
        teamId: p.prediction?.predicted_team_id ?? '',
      };
    }
    return init;
  });

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function updatePrice(id: string, delta: number, basePrice: number) {
    setEntries((prev) => ({
      ...prev,
      [id]: { ...prev[id], price: Math.max(basePrice, prev[id].price + delta) },
    }));
  }

  function updateTeam(id: string, teamId: string) {
    setEntries((prev) => ({
      ...prev,
      [id]: { ...prev[id], teamId },
    }));
  }

  function handleBulkSubmit() {
    const items = Object.values(entries).filter((e) => e.teamId);
    if (!items.length) {
      setResult('Select a team for at least one player.');
      return;
    }
    setResult(null);
    startTransition(async () => {
      const res = await submitBulkPredictions(
        items.map((e) => ({
          playerId: e.playerId,
          predictedPrice: e.price,
          predictedTeamId: e.teamId,
        }))
      );
      if (res.success) {
        const count = res.results.filter((r) => r.success).length;
        setResult(`Saved ${count} prediction${count !== 1 ? 's' : ''}.`);
      } else {
        const errors = res.results.filter((r) => !r.success);
        setResult(`Failed: ${errors[0]?.error ?? 'Unknown error'}`);
      }
    });
  }

  const readyCount = Object.values(entries).filter((e) => e.teamId).length;

  if (!eligible.length) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No players available for prediction.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Player</th>
              <th className="px-3 py-2 font-medium">Price (CAD)</th>
              <th className="px-3 py-2 font-medium">Team</th>
            </tr>
          </thead>
          <tbody>
            {eligible.map((p) => {
              const entry = entries[p.id];
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <div>
                      <span className="font-medium">{p.name}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {p.role}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Base: ${p.base_price.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="min-w-[60px] text-sm font-medium">
                        ${entry.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {[1000, 2000, 5000].map((step) => (
                        <button
                          key={`m-${step}`}
                          type="button"
                          onClick={() => updatePrice(p.id, -step, p.base_price)}
                          className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 hover:bg-red-100"
                        >
                          −{step / 1000}k
                        </button>
                      ))}
                      {[1000, 2000, 5000].map((step) => (
                        <button
                          key={`p-${step}`}
                          type="button"
                          onClick={() => updatePrice(p.id, step, p.base_price)}
                          className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          +{step / 1000}k
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={entry.teamId}
                      onChange={(e) => updateTeam(p.id, e.target.value)}
                      className="h-7 w-full rounded border border-border bg-white px-2 text-xs outline-none"
                    >
                      <option value="">Select</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}{t.captain_name ? ` (${t.captain_name})` : ''}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {result && (
        <p className={`text-xs ${result.startsWith('Failed') ? 'text-destructive' : 'text-emerald-600'}`}>
          {result}
        </p>
      )}

      <Button
        onClick={handleBulkSubmit}
        disabled={isPending || readyCount === 0}
        className="w-full"
      >
        {isPending
          ? 'Submitting…'
          : `Submit ${readyCount} Prediction${readyCount !== 1 ? 's' : ''} 🎯`}
      </Button>
    </div>
  );
}
