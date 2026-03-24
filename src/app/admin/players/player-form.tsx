'use client';

import { useRef, useState, useTransition } from 'react';
import { addPlayer, updatePlayer } from './actions';
import { Button } from '@/components/ui/button';
import type { Player, PlayerRole } from '@/types/player';

const ROLES: PlayerRole[] = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];

interface PlayerFormProps {
  mode?: 'add' | 'edit';
  player?: Player;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function PlayerForm({ mode = 'add', player, onCancel, onSuccess }: PlayerFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = mode === 'edit' && player
        ? await updatePlayer(player.id, formData)
        : await addPlayer(formData);

      if (!result.success) {
        setError(result.error);
      } else {
        if (mode === 'add') {
          formRef.current?.reset();
        }
        onSuccess?.();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={player?.name ?? ''}
            placeholder="Player name"
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="role" className="text-sm font-medium">Role *</label>
          <select
            id="role"
            name="role"
            required
            defaultValue={player?.role ?? ''}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          >
            <option value="" disabled>Select role</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="base_price" className="text-sm font-medium">Base Price (CAD) *</label>
          <input
            id="base_price"
            name="base_price"
            type="number"
            required
            min={0}
            defaultValue={player?.base_price ?? 200}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cricheroes_url" className="text-sm font-medium">CricHeroes URL</label>
          <input
            id="cricheroes_url"
            name="cricheroes_url"
            type="url"
            defaultValue={player?.cricheroes_url ?? ''}
            placeholder="https://cricheroes.com/..."
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_captain"
          name="is_captain"
          type="checkbox"
          defaultChecked={player?.is_captain ?? false}
          className="size-4 rounded border-border"
        />
        <label htmlFor="is_captain" className="text-sm">
          Captain (pre-assigned, skips auction)
        </label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? (mode === 'add' ? 'Adding…' : 'Saving…') : (mode === 'add' ? 'Add Player' : 'Save Changes')}
        </Button>
        {mode === 'edit' && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
