'use client';

import { useState, useMemo } from 'react';
import type { Team } from '@/types/team';

interface EnrichedPrediction {
  id: string;
  user_id: string;
  user_name: string;
  player_id: string;
  predicted_price: number;
  predicted_team_id: string;
  created_at: string;
}

interface PlayerRow {
  id: string;
  name: string;
  role: string;
  base_price: number;
}

interface Props {
  predictions: EnrichedPrediction[];
  players: PlayerRow[];
  teams: Team[];
}

export function PredictionsBrowser({ predictions, players, teams }: Props) {
  const [view, setView] = useState<'by-player' | 'by-user'>('by-player');
  const [search, setSearch] = useState('');

  const teamMap = useMemo(
    () => Object.fromEntries(teams.map((t) => [t.id, t])),
    [teams]
  );
  const playerMap = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p])),
    [players]
  );

  const byPlayer = useMemo(() => {
    const grouped: Record<string, EnrichedPrediction[]> = {};
    for (const p of predictions) {
      (grouped[p.player_id] ??= []).push(p);
    }
    return players
      .map((player) => {
        const preds = grouped[player.id] ?? [];
        const avg =
          preds.length > 0
            ? Math.round(preds.reduce((s, p) => s + p.predicted_price, 0) / preds.length)
            : 0;
        return { player, preds, avg };
      })
      .filter((g) => g.preds.length > 0)
      .sort((a, b) => b.preds.length - a.preds.length);
  }, [predictions, players]);

  const byUser = useMemo(() => {
    const grouped: Record<string, { name: string; preds: EnrichedPrediction[] }> = {};
    for (const p of predictions) {
      if (!grouped[p.user_id]) grouped[p.user_id] = { name: p.user_name, preds: [] };
      grouped[p.user_id].preds.push(p);
    }
    return Object.values(grouped).sort((a, b) => b.preds.length - a.preds.length);
  }, [predictions]);

  const lc = search.toLowerCase();

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-md border border-primary/20 overflow-hidden text-sm">
          <button
            onClick={() => setView('by-player')}
            className={`px-3 py-1.5 transition-colors ${
              view === 'by-player' ? 'bg-primary text-white' : 'hover:bg-muted'
            }`}
          >
            By Player
          </button>
          <button
            onClick={() => setView('by-user')}
            className={`px-3 py-1.5 transition-colors ${
              view === 'by-user' ? 'bg-primary text-white' : 'hover:bg-muted'
            }`}
          >
            By User
          </button>
        </div>
        <input
          type="text"
          placeholder={view === 'by-player' ? 'Search players…' : 'Search users…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-input px-3 py-1.5 text-sm w-56"
        />
      </div>

      {/* By Player View */}
      {view === 'by-player' && (
        <div className="space-y-3">
          {byPlayer
            .filter((g) => g.player.name.toLowerCase().includes(lc))
            .map(({ player, preds, avg }) => (
              <PlayerCard
                key={player.id}
                player={player}
                preds={preds}
                avg={avg}
                teamMap={teamMap}
              />
            ))}
        </div>
      )}

      {/* By User View */}
      {view === 'by-user' && (
        <div className="space-y-3">
          {byUser
            .filter((g) => g.name.toLowerCase().includes(lc))
            .map((group) => (
              <UserCard
                key={group.name}
                group={group}
                playerMap={playerMap}
                teamMap={teamMap}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function PlayerCard({
  player,
  preds,
  avg,
  teamMap,
}: {
  player: PlayerRow;
  preds: EnrichedPrediction[];
  avg: number;
  teamMap: Record<string, Team>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-primary/10 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <span className="font-medium">{player.name}</span>
          <span className="ml-2 text-xs text-muted-foreground">{player.role}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span>{preds.length} prediction{preds.length !== 1 ? 's' : ''}</span>
          <span className="text-muted-foreground">Avg: CAD {avg.toLocaleString()}</span>
          <span className="text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-primary/10 px-4 py-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground text-xs">
                <th className="py-1 font-medium">User</th>
                <th className="py-1 font-medium">Predicted Price</th>
                <th className="py-1 font-medium">Predicted Team</th>
              </tr>
            </thead>
            <tbody>
              {preds.map((p) => (
                <tr key={p.id} className="border-t border-muted/30">
                  <td className="py-1.5">{p.user_name}</td>
                  <td className="py-1.5">CAD {p.predicted_price.toLocaleString()}</td>
                  <td className="py-1.5">
                    <span
                      className="inline-block rounded px-2 py-0.5 text-xs text-white"
                      style={{ backgroundColor: teamMap[p.predicted_team_id]?.color ?? '#888' }}
                    >
                      {teamMap[p.predicted_team_id]?.name ?? p.predicted_team_id}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserCard({
  group,
  playerMap,
  teamMap,
}: {
  group: { name: string; preds: EnrichedPrediction[] };
  playerMap: Record<string, PlayerRow>;
  teamMap: Record<string, Team>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-primary/10 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-medium">{group.name}</span>
        <div className="flex items-center gap-4 text-sm">
          <span>{group.preds.length} prediction{group.preds.length !== 1 ? 's' : ''}</span>
          <span className="text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-primary/10 px-4 py-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground text-xs">
                <th className="py-1 font-medium">Player</th>
                <th className="py-1 font-medium">Predicted Price</th>
                <th className="py-1 font-medium">Predicted Team</th>
              </tr>
            </thead>
            <tbody>
              {group.preds.map((p) => (
                <tr key={p.id} className="border-t border-muted/30">
                  <td className="py-1.5">{playerMap[p.player_id]?.name ?? p.player_id}</td>
                  <td className="py-1.5">CAD {p.predicted_price.toLocaleString()}</td>
                  <td className="py-1.5">
                    <span
                      className="inline-block rounded px-2 py-0.5 text-xs text-white"
                      style={{ backgroundColor: teamMap[p.predicted_team_id]?.color ?? '#888' }}
                    >
                      {teamMap[p.predicted_team_id]?.name ?? p.predicted_team_id}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
