'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { updateMatchSettings } from './actions';
import type { MatchSettings } from '@/types/fixture';

interface Props {
  settings: MatchSettings;
}

export function MatchSettingsForm({ settings }: Props) {
  const [deadlineMinutes, setDeadlineMinutes] = useState(settings.prediction_deadline_minutes);
  const [pointsTeamWin, setPointsTeamWin] = useState(settings.points_team_win);
  const [pointsMom, setPointsMom] = useState(settings.points_mom);
  const [pointsHighestScorer, setPointsHighestScorer] = useState(settings.points_highest_scorer);
  const [pointsHighestWicketTaker, setPointsHighestWicketTaker] = useState(settings.points_highest_wicket_taker);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const res = await updateMatchSettings(
        deadlineMinutes,
        pointsTeamWin,
        pointsMom,
        pointsHighestScorer,
        pointsHighestWicketTaker
      );
      if (res.success) {
        setMessage({ type: 'success', text: 'Settings saved!' });
      } else {
        setMessage({ type: 'error', text: res.error });
      }
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      {message && (
        <p
          className={`text-sm ${
            message.type === 'success' ? 'text-emerald-600' : 'text-destructive'
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="deadlineMinutes" className="text-sm font-medium">
          Prediction Deadline (minutes before match)
        </label>
        <input
          id="deadlineMinutes"
          type="number"
          min={0}
          value={deadlineMinutes}
          onChange={(e) => setDeadlineMinutes(Number(e.target.value))}
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
        />
        <p className="text-xs text-muted-foreground">
          Predictions lock this many minutes before the scheduled match time.
        </p>
      </div>

      <hr className="border-border" />

      <p className="text-sm font-medium">Points per Correct Prediction</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="pointsTeamWin" className="text-sm font-medium">
            Team Win
          </label>
          <input
            id="pointsTeamWin"
            type="number"
            min={0}
            value={pointsTeamWin}
            onChange={(e) => setPointsTeamWin(Number(e.target.value))}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pointsMom" className="text-sm font-medium">
            Man of the Match
          </label>
          <input
            id="pointsMom"
            type="number"
            min={0}
            value={pointsMom}
            onChange={(e) => setPointsMom(Number(e.target.value))}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pointsHighestScorer" className="text-sm font-medium">
            Highest Scorer
          </label>
          <input
            id="pointsHighestScorer"
            type="number"
            min={0}
            value={pointsHighestScorer}
            onChange={(e) => setPointsHighestScorer(Number(e.target.value))}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pointsHighestWicketTaker" className="text-sm font-medium">
            Highest Wicket Taker
          </label>
          <input
            id="pointsHighestWicketTaker"
            type="number"
            min={0}
            value={pointsHighestWicketTaker}
            onChange={(e) => setPointsHighestWicketTaker(Number(e.target.value))}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving…' : 'Save Settings'}
      </Button>
    </div>
  );
}
