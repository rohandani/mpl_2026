import { createClient } from '@/lib/supabase/server';
import type { Team } from '@/types/team';
import { PredictionsBrowser } from './predictions-browser';

interface PredictionRow {
  id: string;
  user_id: string;
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

export default async function AdminPredictionsPage() {
  const supabase = await createClient();

  const [{ data: predictions }, { data: players }, { data: teams }] =
    await Promise.all([
      supabase
        .from('predictions')
        .select('id, user_id, player_id, predicted_price, predicted_team_id, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('players')
        .select('id, name, role, base_price')
        .eq('is_captain', false)
        .order('name'),
      supabase.from('teams').select('*'),
    ]);

  // Collect unique user IDs and fetch their profiles
  const userIds = [...new Set((predictions ?? []).map((p: PredictionRow) => p.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds.length > 0 ? userIds : ['__none__']);

  const profileMap: Record<string, string> = {};
  (profiles ?? []).forEach((p: { id: string; display_name: string | null }) => {
    profileMap[p.id] = p.display_name ?? 'Unknown';
  });

  // If no profiles table, fall back to user_id prefix
  const getUserName = (userId: string) =>
    profileMap[userId] ?? userId.slice(0, 8);

  const enriched = (predictions ?? []).map((p: PredictionRow) => ({
    ...p,
    user_name: getUserName(p.user_id),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">All Predictions</h1>
        <p className="text-sm text-muted-foreground">
          {enriched.length} predictions from {userIds.length} users across{' '}
          {(players ?? []).length} players
        </p>
      </div>
      <PredictionsBrowser
        predictions={enriched}
        players={(players as PlayerRow[]) ?? []}
        teams={(teams as Team[]) ?? []}
      />
    </div>
  );
}
