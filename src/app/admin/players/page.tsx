import { createClient } from '@/lib/supabase/server';
import { PlayerForm } from './player-form';
import { PlayerList } from './player-list';
import type { Player } from '@/types/player';

export default async function PlayersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: true });

  const players: Player[] = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-lg font-semibold">Add Player</h2>
        <div className="rounded-xl border border-border bg-card p-4">
          <PlayerForm />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">All Players ({players.length})</h2>
        {error && (
          <p className="text-sm text-destructive">Failed to load players: {error.message}</p>
        )}
        {players.length === 0 && !error ? (
          <p className="text-sm text-muted-foreground">No players yet. Add one above to get started.</p>
        ) : (
          <PlayerList players={players} />
        )}
      </div>
    </div>
  );
}
