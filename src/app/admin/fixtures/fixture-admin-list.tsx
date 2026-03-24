'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FixtureForm } from './fixture-form';
import { FixtureResultForm } from './fixture-result-form';
import type { Fixture } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

interface Props {
  fixtures: Fixture[];
  teams: Team[];
  players: Player[];
}

export function FixtureAdminList({ fixtures, teams, players }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);

  const teamMap = new Map(teams.map((t) => [t.id, t]));

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
                <th className="py-2.5 pl-4 text-left font-medium text-muted-foreground">#</th>
                <th className="py-2.5 text-left font-medium text-muted-foreground">Teams</th>
                <th className="py-2.5 text-left font-medium text-muted-foreground">Date</th>
                <th className="py-2.5 text-left font-medium text-muted-foreground">Venue</th>
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

                return (
                  <tr key={f.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pl-4 font-medium">{f.match_number}</td>
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
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="py-2.5 pr-4 text-right space-x-1">
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
