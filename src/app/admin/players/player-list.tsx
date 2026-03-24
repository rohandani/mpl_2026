'use client';

import { useTransition } from 'react';
import { deletePlayer } from './actions';
import { PlayerCard } from './player-card';
import { PlayerForm } from './player-form';
import type { Player } from '@/types/player';
import { useState } from 'react';

export function PlayerList({ players }: { players: Player[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDelete(playerId: string) {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    startTransition(async () => {
      await deletePlayer(playerId);
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((player) =>
        editingId === player.id ? (
          <div key={player.id} className="rounded-xl border border-border bg-card p-4">
            <PlayerForm
              mode="edit"
              player={player}
              onCancel={() => setEditingId(null)}
              onSuccess={() => setEditingId(null)}
            />
          </div>
        ) : (
          <PlayerCard
            key={player.id}
            player={player}
            onEdit={() => setEditingId(player.id)}
            onDelete={handleDelete}
          />
        )
      )}
    </div>
  );
}
