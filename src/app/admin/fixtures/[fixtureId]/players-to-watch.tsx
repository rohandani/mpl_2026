'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, TrashIcon } from 'lucide-react';
import type { Player } from '@/types/player';
import type { PlayerToWatch, HighlightType } from '@/types/player-to-watch';
import { HIGHLIGHT_TYPE_LABELS } from '@/types/player-to-watch';

interface Props {
  fixtureId: string;
  players: Pick<Player, 'id' | 'name' | 'role' | 'team_id'>[];
  teams: { id: string; name: string }[];
  existingPlayersToWatch: (PlayerToWatch & {
    player: Pick<Player, 'id' | 'name' | 'role' | 'team_id'>;
  })[];
  onUpdate: () => void;
}

export function PlayersToWatchManager({
  fixtureId,
  players,
  teams,
  existingPlayersToWatch,
  onUpdate,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [playersToWatch, setPlayersToWatch] = useState(existingPlayersToWatch);
  const [newEntry, setNewEntry] = useState({
    playerId: '',
    highlightType: 'form' as HighlightType,
    description: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync with parent state updates
  useEffect(() => {
    setPlayersToWatch(existingPlayersToWatch);
  }, [existingPlayersToWatch]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const teamMap = new Map(teams.map((t) => [t.id, t]));

  async function fetchLatestPlayersToWatch() {
    try {
      const response = await fetch(`/api/admin/fixtures/${fixtureId}/players-to-watch`);
      if (response.ok) {
        const data = await response.json();
        setPlayersToWatch(data);
      }
    } catch (error) {
      console.error('Failed to fetch latest players to watch:', error);
    }
  }

  async function addPlayer() {
    if (!newEntry.playerId) return;

    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/players-to-watch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fixtureId,
            playerId: newEntry.playerId,
            highlightType: newEntry.highlightType,
            description: newEntry.description || null,
            sortOrder: playersToWatch.length,
          }),
        });

        if (response.ok) {
          setNewEntry({ playerId: '', highlightType: 'form', description: '' });
          // Immediately fetch and update the local state
          await fetchLatestPlayersToWatch();
          // Also call the parent callback for any additional updates
          onUpdate();
          setMessage({ type: 'success', text: 'Player added successfully!' });
        } else {
          setMessage({ type: 'error', text: 'Failed to add player. Please try again.' });
        }
      } catch (error) {
        console.error('Failed to add player to watch:', error);
        setMessage({ type: 'error', text: 'Failed to add player. Please try again.' });
      }
    });
  }

  async function removePlayer(playerToWatchId: string) {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/players-to-watch/${playerToWatchId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Immediately fetch and update the local state
          await fetchLatestPlayersToWatch();
          // Also call the parent callback for any additional updates
          onUpdate();
          setMessage({ type: 'success', text: 'Player removed successfully!' });
        } else {
          setMessage({ type: 'error', text: 'Failed to remove player. Please try again.' });
        }
      } catch (error) {
        console.error('Failed to remove player to watch:', error);
        setMessage({ type: 'error', text: 'Failed to remove player. Please try again.' });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>👀</span>
          Players to Watch
          <span className="text-sm font-normal text-muted-foreground">
            ({playersToWatch.length} selected)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success/Error messages */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Existing players */}
        {playersToWatch.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {playersToWatch.map((ptw) => (
              <div
                key={ptw.id}
                className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{ptw.player.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      ({ptw.player.role})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-background flex-shrink-0">
                      {teamMap.get(ptw.player.team_id ?? '')?.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary flex-shrink-0">
                      {HIGHLIGHT_TYPE_LABELS[ptw.highlight_type]}
                    </span>
                  </div>
                  {ptw.description && (
                    <p className="text-xs text-muted-foreground overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {ptw.description}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => removePlayer(ptw.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive flex-shrink-0"
                  disabled={isPending}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new player */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="text-sm font-medium">Add Player to Watch</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Player</label>
              <select
                value={newEntry.playerId}
                onChange={(e) => setNewEntry({ ...newEntry, playerId: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border rounded-lg"
              >
                <option value="">Select player...</option>
                {teams.map((team) => (
                  <optgroup key={team.id} label={team.name}>
                    {players
                      .filter((p) => p.team_id === team.id)
                      .filter((p) => !playersToWatch.some((ptw) => ptw.player_id === p.id))
                      .map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name} ({player.role})
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Highlight Type</label>
              <select
                value={newEntry.highlightType}
                onChange={(e) => setNewEntry({ ...newEntry, highlightType: e.target.value as HighlightType })}
                className="w-full mt-1 px-3 py-2 text-sm border rounded-lg"
              >
                {Object.entries(HIGHLIGHT_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">
              Description (optional)
            </label>
            <input
              type="text"
              value={newEntry.description}
              onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
              placeholder="Why should users watch this player?"
              className="w-full mt-1 px-3 py-2 text-sm border rounded-lg"
            />
          </div>

          <Button
            onClick={addPlayer}
            disabled={!newEntry.playerId || isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {playersToWatch.some(p => p.player_id === newEntry.playerId) ? 'Removing...' : 'Adding...'}
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Player to Watch
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}