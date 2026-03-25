'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { createFixture, updateFixture } from './actions';
import type { Fixture } from '@/types/fixture';
import type { Team } from '@/types/team';

interface Props {
  teams: Team[];
  fixture?: Fixture;
  onDone: () => void;
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function FixtureForm({ teams, fixture, onDone }: Props) {
  const isEdit = !!fixture;
  const [teamAId, setTeamAId] = useState(fixture?.team_a_id ?? '');
  const [teamBId, setTeamBId] = useState(fixture?.team_b_id ?? '');
  const [matchDate, setMatchDate] = useState(fixture ? toDatetimeLocal(fixture.match_date) : '');
  const [venue, setVenue] = useState(fixture?.venue ?? '');
  const [status, setStatus] = useState<Fixture['status']>(fixture?.status ?? 'upcoming');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const inputClass =
    'h-8 w-full rounded-md border border-border bg-white px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50';

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      let res;
      if (isEdit) {
        res = await updateFixture(fixture!.id, {
          team_a_id: teamAId,
          team_b_id: teamBId,
          match_date: new Date(matchDate).toISOString(),
          venue: venue.trim() || null,
          status,
        });
      } else {
        res = await createFixture(teamAId, teamBId, new Date(matchDate).toISOString(), venue.trim() || null);
      }
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
        <span className="text-xs font-medium text-muted-foreground">Team A</span>
        <select value={teamAId} onChange={(e) => setTeamAId(e.target.value)} className={inputClass}>
          <option value="">Select team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Team B</span>
        <select value={teamBId} onChange={(e) => setTeamBId(e.target.value)} className={inputClass}>
          <option value="">Select team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Match Date & Time</span>
        <input
          type="datetime-local"
          value={matchDate}
          onChange={(e) => setMatchDate(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Venue</span>
        <input
          type="text"
          placeholder="Optional"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          className={inputClass}
        />
      </label>

      {isEdit && (
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as Fixture['status'])} className={inputClass}>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      )}

      <div className="col-span-2 flex items-center gap-2 pt-1">
        {error && <span className="text-xs text-destructive">{error}</span>}
        <Button size="sm" onClick={handleSubmit} disabled={isPending || !teamAId || !teamBId || !matchDate}>
          {isPending ? 'Saving…' : isEdit ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
}
