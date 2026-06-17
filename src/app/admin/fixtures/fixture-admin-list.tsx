'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FixtureForm } from './fixture-form';
import { FixtureResultForm } from './fixture-result-form';
import { togglePredictionLock } from './actions';
import type { Fixture, MatchPrediction } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

interface MatchPredictionWithProfile extends MatchPrediction {
  profiles: { display_name: string | null } | null;
}

interface Props {
  fixtures: Fixture[];
  teams: Team[];
  players: Player[];
  matchPredictions: MatchPredictionWithProfile[];
}

export function FixtureAdminList({ fixtures, teams, players, matchPredictions }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const playerMap = new Map(players.map((p) => [p.id, p]));

  // Group predictions by fixture
  const predictionsByFixture = new Map<string, MatchPredictionWithProfile[]>();
  matchPredictions.forEach((prediction) => {
    if (!predictionsByFixture.has(prediction.fixture_id)) {
      predictionsByFixture.set(prediction.fixture_id, []);
    }
    predictionsByFixture.get(prediction.fixture_id)!.push(prediction);
  });

  function handleToggleLock(fixtureId: string, currentlyLocked: boolean) {
    startTransition(async () => {
      await togglePredictionLock(fixtureId, !currentlyLocked);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setShowCreate(!showCreate); setEditingId(null); setResultId(null); }}>
          {showCreate ? 'Cancel' : '+ New Fixture'}
        </Button>
      </div>

      {showCreate && (
        <div className="rounded-xl ring-1 ring-border p-4">
          <h2 className="text-sm font-semibold mb-3">Create Fixture</h2>
          <FixtureForm teams={teams} onDone={() => setShowCreate(false)} />
        </div>
      )}

      {fixtures.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No fixtures yet. Create one to get started.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl ring-1 ring-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="py-2.5 pl-4 text-left font-medium text-muted-foreground">Stage</th>
                <th className="py-2.5 text-left font-medium text-muted-foreground">Teams</th>
                <th className="py-2.5 text-left font-medium text-muted-foreground">Date</th>
                <th className="py-2.5 text-left font-medium text-muted-foreground">Venue</th>
                <th className="py-2.5 text-left font-medium text-muted-foreground">Predictions</th>
                <th className="py-2.5 text-left font-medium text-muted-foreground">Status</th>
                <th className="py-2.5 pr-4 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fixtures.map((f) => {
                const teamA = teamMap.get(f.team_a_id);
                const teamB = teamMap.get(f.team_b_id);
                const isEditing = editingId === f.id;
                const isResult = resultId === f.id;
                const fixturePredictions = predictionsByFixture.get(f.id) || [];

                return (
                  <tr key={f.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pl-4 font-medium">{f.stage}</td>
                    <td className="py-2.5">
                      {teamA?.name ?? f.team_a_id} vs {teamB?.name ?? f.team_b_id}
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      {new Date(f.match_date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 text-muted-foreground">{f.venue ?? '—'}</td>
                    <td className="py-2.5">
                      {fixturePredictions.length > 0 ? (
                        <Link href={`/admin/fixtures/${f.id}/predictions`}>
                          <Button
                            size="xs"
                            variant="outline"
                            className="text-xs"
                          >
                            {fixturePredictions.length} prediction{fixturePredictions.length !== 1 ? 's' : ''}
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">No predictions</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-1">
                        <StatusBadge status={f.status} />
                        {f.predictions_locked && f.status !== 'completed' && (
                          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                            🔒
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right space-x-1">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => window.open(`/admin/fixtures/${f.id}`, '_blank')}
                        title="Manage Players to Watch"
                      >
                        👀 Players
                      </Button>
                      {f.status !== 'completed' && (
                        <>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => { setEditingId(isEditing ? null : f.id); setResultId(null); setShowCreate(false); }}
                          >
                            {isEditing ? 'Cancel' : 'Edit'}
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => { setResultId(isResult ? null : f.id); setEditingId(null); setShowCreate(false); }}
                          >
                            {isResult ? 'Cancel' : 'Result'}
                          </Button>
                          <Button
                            size="xs"
                            variant={f.predictions_locked ? 'destructive' : 'outline'}
                            disabled={isPending}
                            onClick={() => handleToggleLock(f.id, f.predictions_locked)}
                          >
                            {f.predictions_locked ? '🔒 Unlock' : '🔓 Lock'}
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editingId && (
        <div className="rounded-xl ring-1 ring-border p-4">
          <h2 className="text-sm font-semibold mb-3">Edit Fixture</h2>
          <FixtureForm
            teams={teams}
            fixture={fixtures.find((f) => f.id === editingId)}
            onDone={() => setEditingId(null)}
          />
        </div>
      )}

      {resultId && (
        <div className="rounded-xl ring-1 ring-border p-4">
          <h2 className="text-sm font-semibold mb-3">Submit Result</h2>
          <FixtureResultForm
            fixture={fixtures.find((f) => f.id === resultId)!}
            teams={teams}
            players={players}
            onDone={() => setResultId(null)}
          />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-700',
    live: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? ''}`}>
      {status}
    </span>
  );
}
