'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { submitFixtureResult } from './actions';
import type { Fixture } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

interface Props {
  fixture: Fixture;
  teams: Team[];
  players: Player[];
  onDone: () => void;
}

export function FixtureResultForm({ fixture, teams, players, onDone }: Props) {
  const fixtureTeams = teams.filter(
    (t) => t.id === fixture.team_a_id || t.id === fixture.team_b_id
  );
  const fixturePlayers = players.filter(
    (p) => p.team_id === fixture.team_a_id || p.team_id === fixture.team_b_id
  );

  const [winningTeamId, setWinningTeamId] = useState(fixture.winning_team_id ?? '');
  const [momPlayerId, setMomPlayerId] = useState(fixture.mom_player_id ?? '');
  const [highestScorerId, setHighestScorerId] = useState(fixture.highest_scorer_id ?? '');
  const [highestWicketTakerId, setHighestWicketTakerId] = useState(fixture.highest_wicket_taker_id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectClass =
    'h-8 w-full rounded-md border border-border bg-white px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50';

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const res = await submitFixtureResult(
        fixture.id,
        winningTeamId,
        momPlayerId,
        highestScorerId,
        highestWicketTakerId
      );
      if (!res.success) {
        setError(res.error);
      } else {
        onDone();
      }
    });
  }

  return (
    <div className="grid grid-cols-2 gap-3 max-w-xl">
      <label className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Winning Team</span>
        <select value={winningTeamId} onChange={(e) => setWinningTeamId(e.target.value)} className={selectClass}>
          <option value="">Select team</option>
          {fixtureTeams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Man of the Match</span>
        <select value={momPlayerId} onChange={(e) => setMomPlayerId(e.target.value)} className={selectClass}>
          <option value="">Select player</option>
          {fixturePlayers.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Highest Scorer</span>
        <select value={highestScorerId} onChange={(e) => setHighestScorerId(e.target.value)} className={selectClass}>
          <option value="">Select player</option>
          {fixturePlayers.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Highest Wicket Taker</span>
        <select value={highestWicketTakerId} onChange={(e) => setHighestWicketTakerId(e.target.value)} className={selectClass}>
          <option value="">Select player</option>
          {fixturePlayers.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>

      <div className="col-span-2 flex items-center gap-2 pt-1">
        {error && <span className="text-xs text-destructive">{error}</span>}
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isPending || !winningTeamId || !momPlayerId || !highestScorerId || !highestWicketTakerId}
        >
          {isPending ? 'Submitting…' : 'Submit Result'}
        </Button>
      </div>
    </div>
  );
}
