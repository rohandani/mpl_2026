'use client';

import { useState, useMemo } from 'react';
import type { PlayerWithPrediction } from '@/types/prediction';
import type { Team } from '@/types/team';
import { PredictionCard } from './prediction-card';

type StatusFilter = 'all' | 'not-predicted' | 'predicted' | 'results';
type RoleFilter = 'All Roles' | 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';

const ROLES: RoleFilter[] = ['All Roles', 'Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];

interface Props {
  players: PlayerWithPrediction[];
  teams: Team[];
  isAdmin: boolean;
}

function hasResult(p: PlayerWithPrediction) {
  return p.auction?.sold_price != null;
}

export function PredictionsShell({ players, teams, isAdmin }: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [role, setRole] = useState<RoleFilter>('All Roles');

  const counts = useMemo(() => {
    const all = players.length;
    const notPredicted = players.filter((p) => !p.prediction).length;
    const predicted = players.filter((p) => p.prediction && !hasResult(p)).length;
    const results = players.filter((p) => hasResult(p)).length;
    return { all, notPredicted, predicted, results };
  }, [players]);

  const filtered = useMemo(() => {
    return players.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (role !== 'All Roles' && p.role !== role) return false;
      if (status === 'not-predicted' && p.prediction) return false;
      if (status === 'predicted' && (!p.prediction || hasResult(p))) return false;
      if (status === 'results' && !hasResult(p)) return false;
      return true;
    });
  }, [players, search, status, role]);

  const statusTabs: { key: StatusFilter; label: string; count: number; icon: string }[] = [
    { key: 'all', label: 'All', count: counts.all, icon: '🏏' },
    { key: 'not-predicted', label: 'Not Predicted', count: counts.notPredicted, icon: '📝' },
    { key: 'predicted', label: 'Predicted', count: counts.predicted, icon: '✅' },
    { key: 'results', label: 'Results', count: counts.results, icon: '📊' },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search players..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-10 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
      />

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatus(tab.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              status === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-white text-muted-foreground ring-1 ring-border hover:bg-muted'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            <span
              className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                status === tab.key
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Role filter pills */}
      <div className="flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              role === r
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-white text-muted-foreground ring-1 ring-border hover:bg-muted'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        ✨ Showing {filtered.length} of {players.length} players
      </p>

      {/* Player grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((player) => (
          <PredictionCard
            key={player.id}
            player={player}
            teams={teams}
            isAdmin={isAdmin}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
            No players match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
