'use client';

import { useState } from 'react';
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
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Simple callback to trigger any parent-level updates if needed
  const handleUpdate = () => {
    setLastUpdated(Date.now());
  };

  return (
    <PlayersToWatchManager
      fixtureId={fixtureId}
      players={players}
      teams={teams}
      existingPlayersToWatch={initialPlayersToWatch}
      onUpdate={handleUpdate}
    />
  );
}