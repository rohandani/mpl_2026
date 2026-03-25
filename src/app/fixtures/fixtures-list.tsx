'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { isPredictionOpen } from '@/lib/scoring';
import type { Fixture, MatchPrediction, MatchSettings } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

interface Props {
  fixtures: Fixture[];
  teams: Team[];
  players: Pick<Player, 'id' | 'name'>[];
  predictions: MatchPrediction[];
  settings: MatchSettings;
}

const STATUS_BADGE: Record<Fixture['status'], { label: string; className: string }> = {
  upcoming: { label: 'Upcoming', className: 'bg-blue-100 text-blue-700' },
  live: { label: 'Live', className: 'bg-red-100 text-red-700' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
};

export function FixturesList({ fixtures, teams, players, predictions, settings }: Props) {
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const playerMap = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const predictionMap = useMemo(
    () => new Map(predictions.map((p) => [p.fixture_id, p])),
    [predictions],
  );

  const deadlineMinutes = settings?.prediction_deadline_minutes ?? 15;

  if (fixtures.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <h1 className="text-2xl font-bold">Fixtures</h1>
          </div>
        </div>
        <p className="py-12 text-center text-sm text-muted-foreground">
          No fixtures scheduled yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📅</span>
          <h1 className="text-2xl font-bold">Fixtures</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {fixtures.length} match{fixtures.length !== 1 ? 'es' : ''} scheduled
        </p>
      </div>

      <div className="space-y-3">
        {fixtures.map((fixture) => {
          const teamA = teamMap.get(fixture.team_a_id);
          const teamB = teamMap.get(fixture.team_b_id);
          const prediction = predictionMap.get(fixture.id);
          const open = isPredictionOpen(fixture, deadlineMinutes);
          const isCompleted = fixture.status === 'completed';

          return (
            <FixtureCard
              key={fixture.id}
              fixture={fixture}
              teamA={teamA}
              teamB={teamB}
              playerMap={playerMap}
              prediction={prediction}
              isPredictionOpen={open}
              isCompleted={isCompleted}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FixtureCard                                                       */
/* ------------------------------------------------------------------ */

interface FixtureCardProps {
  fixture: Fixture;
  teamA: Team | undefined;
  teamB: Team | undefined;
  playerMap: Map<string, Pick<Player, 'id' | 'name'>>;
  prediction: MatchPrediction | undefined;
  isPredictionOpen: boolean;
  isCompleted: boolean;
}

function FixtureCard({
  fixture,
  teamA,
  teamB,
  prediction,
  isPredictionOpen: open,
  isCompleted,
}: FixtureCardProps) {
  const badge = STATUS_BADGE[fixture.status];
  const matchDate = new Date(fixture.match_date);

  return (
    <Link
      href={`/fixtures/${fixture.id}`}
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
    >
      {/* Top row: match number, date, status badge */}
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Match #{fixture.match_number}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-4">
        <TeamBadge team={teamA} />
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground">vs</span>
        </div>
        <TeamBadge team={teamB} />
      </div>

      {/* Bottom row: date/venue + action hint */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div>
          <span>{matchDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          {fixture.venue && <span> · {fixture.venue}</span>}
        </div>
        {open && !prediction && (
          <span className="font-medium text-primary">Predict →</span>
        )}
        {open && prediction && (
          <span className="font-medium text-emerald-600">✓ Predicted</span>
        )}
        {isCompleted && (
          <span className="font-medium text-primary">View Results →</span>
        )}
      </div>
    </Link>
  );
}

function TeamBadge({ team }: { team: Team | undefined }) {
  if (!team) return <span className="text-sm text-muted-foreground">TBD</span>;
  return (
    <div className="flex items-center gap-2">
      <Image src={team.logo} alt={team.name} width={28} height={28} className="rounded-full" />
      <span className="text-sm font-semibold">{team.name}</span>
    </div>
  );
}
