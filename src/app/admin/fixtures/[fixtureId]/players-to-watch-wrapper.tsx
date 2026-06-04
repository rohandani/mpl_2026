'use client';

import { useState, useEffect } from 'react';
import { PlayersToWatchManager } from './players-to-watch';
import type { Player } from '@/types/player';
import type { PlayerToWatch } from '@/types/player-to-watch';

interface Props {
  fixtureId: string;
  players: Pick<Player, 'id' | 'name' | 'role' | 'team_id'>[];
  teams: { id: string; name: string }[];
  initialPlayersToWatch: (PlayerToWatch & {
    player: Pick<Player, 'id' | 'name' | 'role' | 'team_id'>;
  })[];
}

export function PlayersToWatchManagerWrapper({
  fixtureId,
  players,
  teams,
  initialPlayersToWatch,
}: Props) {
  const [playersToWatch, setPlayersToWatch] = useState(initialPlayersToWatch);
  const [isLoading, setIsLoading] = useState(false);

  async function refreshData() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/fixtures/${fixtureId}/players-to-watch`);
      if (response.ok) {
        const data = await response.json();
        setPlayersToWatch(data);
      }
    } catch (error) {
      console.error('Failed to refresh players to watch:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
      <PlayersToWatchManager
        fixtureId={fixtureId}
        players={players}
        teams={teams}
        existingPlayersToWatch={playersToWatch}
        onUpdate={refreshData}
      />
    </div>
  );
}