'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, ExternalLink } from 'lucide-react';
import { submitPrediction } from './actions';
import { calcTotalPoints } from '@/lib/scoring';
import type { PlayerWithPrediction } from '@/types/prediction';
import type { Team } from '@/types/team';

interface Props {
  player: PlayerWithPrediction;
  teams: Team[];
  predictionsLocked: boolean;
}

export function PredictionCard({ player, teams, predictionsLocked }: Props) {
  const hasResult = player.auction?.sold_price != null;
  const hasPrediction = !!player.prediction;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [price, setPrice] = useState(
    player.prediction?.predicted_price?.toString() ?? ''
  );
  const [teamId, setTeamId] = useState(
    player.prediction?.predicted_team_id ?? ''
  );

  function handleSubmitPrediction() {
    setError(null);
    startTransition(async () => {
      const res = await submitPrediction(player.id, Number(price), teamId);
      if (!res.success) setError(res.error);
    });
  }

  const score =
    hasResult && hasPrediction
      ? calcTotalPoints(
          player.prediction!.predicted_price,
          player.prediction!.predicted_team_id,
          player.auction!.sold_price!,
          player.auction!.sold_to_team_id!
        )
      : null;

  const soldTeam = teams.find((t) => t.id === player.auction?.sold_to_team_id);
  const predictedTeam = teams.find(
    (t) => t.id === player.prediction?.predicted_team_id
  );

  return (
    <Card className="pt-0 relative overflow-hidden">
      <div
        className="h-1.5 rounded-t-xl"
        style={{
          background: hasResult
            ? `linear-gradient(to right, ${soldTeam?.color ?? '#94a3b8'}, ${soldTeam?.color ?? '#94a3b8'}88)`
            : 'linear-gradient(to right, #10b981, #14b8a6)',
        }}
      />
      <CardContent className="space-y-3 pt-3">
        {/* Player header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="size-5 text-muted-foreground" />
            </div>
            <div>
              <span className="font-semibold">{player.name}</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>💰 Base: ${player.base_price}</span>
              </div>
            </div>
          </div>
          {hasResult && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Result Out
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
            {player.role}
          </span>
          {player.cricheroes_url && (
            <a
              href={player.cricheroes_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              CricHeroes <ExternalLink className="size-3" />
            </a>
          )}
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {/* Result section */}
        {hasResult && (
          <div className="rounded-lg bg-muted/60 p-3 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Actual Result
            </p>
            <p className="text-sm font-medium">
              Sold for{' '}
              <span className="text-primary">${player.auction!.sold_price}</span>
              {' · '}
              {soldTeam?.name ?? 'Unknown'}
            </p>
          </div>
        )}

        {/* Prediction display (when predicted and result is out) */}
        {hasResult && hasPrediction && score && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600">✅</span>
              <p className="text-sm font-semibold text-emerald-800">
                Your Prediction
              </p>
            </div>
            <p className="text-sm">
              Price: ${player.prediction!.predicted_price} · Team:{' '}
              {predictedTeam?.name ?? '?'}
            </p>
            <p className="text-sm font-semibold text-emerald-700">
              ✨ {score.total} pts
              <span className="ml-1 font-normal text-emerald-600 text-xs">
                (team: {score.teamPoints}, price: {score.pricePoints})
              </span>
            </p>
          </div>
        )}

        {/* Prediction display (predicted but no result yet) */}
        {!hasResult && hasPrediction && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600">✅</span>
              <p className="text-sm font-semibold text-emerald-800">
                Your Prediction
              </p>
            </div>
            <p className="text-sm">
              Price: ${player.prediction!.predicted_price} · Team:{' '}
              {predictedTeam?.name ?? '?'}
            </p>
            {!predictionsLocked && (
              <p className="text-[11px] text-muted-foreground">
                You can update until the result is announced.
              </p>
            )}
          </div>
        )}

        {/* Prediction form (no result yet, not locked) */}
        {!hasResult && !predictionsLocked && (
          <div className="space-y-2.5 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              {hasPrediction ? 'Update Prediction' : '🎯 Your Prediction'}
            </p>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">
                Predicted selling price (CAD)
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 1200"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-8 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">
                Which team will buy?
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="h-8 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
              >
                <option value="">Select team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleSubmitPrediction}
              disabled={isPending || !price || !teamId}
              className="w-full"
            >
              {isPending
                ? 'Submitting…'
                : hasPrediction
                  ? 'Update Prediction'
                  : 'Submit Prediction 🎯'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
