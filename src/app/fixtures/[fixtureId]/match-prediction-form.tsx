'use client';

import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { submitMatchPrediction } from './actions';
import type { Fixture, MatchPrediction } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

interface Props {
  fixture: Fixture;
  teamA: Team | null;
  teamB: Team | null;
  players: Pick<Player, 'id' | 'name' | 'role' | 'team_id'>[];
  prediction: MatchPrediction | null;
  isPredictionOpen: boolean;
  deadlineDate: string;
}

export function MatchPredictionForm({
  fixture,
  teamA,
  teamB,
  players,
  prediction,
  isPredictionOpen: initialOpen,
  deadlineDate,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [winnerId, setWinnerId] = useState(prediction?.predicted_winner_id ?? '');
  const [momId, setMomId] = useState(prediction?.predicted_mom_id ?? '');
  const [highestScorerId, setHighestScorerId] = useState(
    prediction?.predicted_highest_scorer_id ?? ''
  );
  const [highestWicketTakerId, setHighestWicketTakerId] = useState(
    prediction?.predicted_highest_wicket_taker_id ?? ''
  );

  // Live countdown
  const [open, setOpen] = useState(initialOpen);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const deadline = new Date(deadlineDate);

    function tick() {
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      if (diff <= 0) {
        setOpen(false);
        setTimeLeft('');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      } else if (mins > 0) {
        setTimeLeft(`${mins}m ${secs}s`);
      } else {
        setTimeLeft(`${secs}s`);
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadlineDate]);

  function handleSubmit() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await submitMatchPrediction(
        fixture.id,
        winnerId || null,
        momId || null,
        highestScorerId || null,
        highestWicketTakerId || null
      );
      if (!res.success) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  }

  const hasPrediction = !!prediction;
  const teams = [teamA, teamB].filter(Boolean) as Team[];

  // Locked state
  if (!open) {
    return (
      <Card className="pt-0">
        <div className="h-1.5 rounded-t-xl bg-gradient-to-r from-gray-400 to-gray-500" />
        <CardContent className="space-y-3 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔒</span>
            <p className="text-sm font-semibold">Predictions Locked</p>
          </div>
          <p className="text-xs text-muted-foreground">
            The prediction deadline for this match has passed.
          </p>
          {hasPrediction && (
            <PredictionSummary
              prediction={prediction}
              teams={teams}
              players={players}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-0">
      <div className="h-1.5 rounded-t-xl bg-gradient-to-r from-emerald-500 to-teal-500" />
      <CardContent className="space-y-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <p className="text-sm font-semibold">
              {hasPrediction ? 'Update Prediction' : 'Make Your Prediction'}
            </p>
          </div>
          {timeLeft && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              ⏱ {timeLeft}
            </span>
          )}
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}
        {success && (
          <p className="text-xs text-emerald-600">
            ✅ Prediction {hasPrediction ? 'updated' : 'submitted'} successfully!
          </p>
        )}

        {/* Winning team */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground" htmlFor="winner-select">
            Who will win?
          </label>
          <select
            id="winner-select"
            value={winnerId}
            onChange={(e) => setWinnerId(e.target.value)}
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

        {/* Man of the Match */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground" htmlFor="mom-select">
            Man of the Match
          </label>
          <select
            id="mom-select"
            value={momId}
            onChange={(e) => setMomId(e.target.value)}
            className="h-8 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          >
            <option value="">Select player</option>
            {teams.map((team) => (
              <optgroup key={team.id} label={team.name}>
                {players
                  .filter((p) => p.team_id === team.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Highest Scorer */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground" htmlFor="scorer-select">
            Highest Scorer
          </label>
          <select
            id="scorer-select"
            value={highestScorerId}
            onChange={(e) => setHighestScorerId(e.target.value)}
            className="h-8 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          >
            <option value="">Select player</option>
            {teams.map((team) => (
              <optgroup key={team.id} label={team.name}>
                {players
                  .filter((p) => p.team_id === team.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Highest Wicket Taker */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground" htmlFor="wicket-select">
            Highest Wicket Taker
          </label>
          <select
            id="wicket-select"
            value={highestWicketTakerId}
            onChange={(e) => setHighestWicketTakerId(e.target.value)}
            className="h-8 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          >
            <option value="">Select player</option>
            {teams.map((team) => (
              <optgroup key={team.id} label={team.name}>
                {players
                  .filter((p) => p.team_id === team.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isPending || (!winnerId && !momId && !highestScorerId && !highestWicketTakerId)}
          className="w-full"
        >
          {isPending
            ? 'Submitting…'
            : hasPrediction
              ? 'Update Prediction'
              : 'Submit Prediction 🎯'}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center">
          All fields are optional. You can submit partial predictions.
        </p>
      </CardContent>
    </Card>
  );
}

function PredictionSummary({
  prediction,
  teams,
  players,
}: {
  prediction: MatchPrediction;
  teams: Team[];
  players: Pick<Player, 'id' | 'name' | 'role' | 'team_id'>[];
}) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const playerMap = new Map(players.map((p) => [p.id, p]));

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        <span className="text-emerald-600">✅</span>
        <p className="text-sm font-semibold text-emerald-800">Your Prediction</p>
      </div>
      <div className="text-sm space-y-0.5">
        {prediction.predicted_winner_id && (
          <p>🏆 Winner: {teamMap.get(prediction.predicted_winner_id)?.name ?? '—'}</p>
        )}
        {prediction.predicted_mom_id && (
          <p>⭐ MoM: {playerMap.get(prediction.predicted_mom_id)?.name ?? '—'}</p>
        )}
        {prediction.predicted_highest_scorer_id && (
          <p>🏏 Highest Scorer: {playerMap.get(prediction.predicted_highest_scorer_id)?.name ?? '—'}</p>
        )}
        {prediction.predicted_highest_wicket_taker_id && (
          <p>🎳 Highest Wicket Taker: {playerMap.get(prediction.predicted_highest_wicket_taker_id)?.name ?? '—'}</p>
        )}
      </div>
    </div>
  );
}
