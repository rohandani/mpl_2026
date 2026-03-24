import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { AppHeader } from '@/components/app-header';
import { PredictionsShell } from './predictions-shell';
import type { PlayerWithPrediction, Auction } from '@/types/prediction';
import type { Team } from '@/types/team';

export default async function PredictionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: players } = await supabase
    .from('players')
    .select('id, name, role, base_price, is_captain, team_id')
    .eq('is_captain', false)
    .order('name');

  const { data: auctions } = await supabase.from('auctions').select('*');

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id);

  const { data: teams } = await supabase.from('teams').select('*');

  const auctionMap = new Map(
    (auctions ?? []).map((a: Auction) => [a.player_id, a])
  );
  const predictionMap = new Map(
    (predictions ?? []).map((p) => [p.player_id, p])
  );

  const playersWithPredictions: PlayerWithPrediction[] = (players ?? []).map(
    (player) => ({
      ...player,
      auction: auctionMap.get(player.id) ?? null,
      prediction: predictionMap.get(player.id) ?? null,
    })
  );

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showAdmin={isAdmin(user)} />
      <main className="flex-1 px-4 py-6">
        <PredictionsShell
          players={playersWithPredictions}
          teams={(teams as Team[]) ?? []}
        />
      </main>
    </div>
  );
}
