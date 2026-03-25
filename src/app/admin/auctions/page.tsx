import { createClient } from '@/lib/supabase/server';
import { AuctionList } from './auction-list';
import { PredictionLockToggle } from './prediction-lock-toggle';
import type { Player } from '@/types/player';
import type { Team } from '@/types/team';
import type { Auction } from '@/types/prediction';

export default async function AuctionsPage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('is_captain', false)
    .order('name');

  const { data: auctions } = await supabase.from('auctions').select('*');
  const { data: teams } = await supabase.from('teams').select('*');

  const { data: settings } = await supabase
    .from('app_settings')
    .select('predictions_locked')
    .eq('id', 'default')
    .single();

  const predictionsLocked = settings?.predictions_locked ?? false;

  const auctionMap = new Map(
    (auctions ?? []).map((a: Auction) => [a.player_id, a])
  );

  const auctionablePlayers = (players ?? []).map((p: Player) => ({
    ...p,
    auction: auctionMap.get(p.id) ?? null,
  }));

  const sold = auctionablePlayers.filter((p) => p.auction?.sold_price != null);
  const pending = auctionablePlayers.filter((p) => p.auction?.sold_price == null);

  return (
    <div className="space-y-6">
      <PredictionLockToggle initialLocked={predictionsLocked} />

      <div>
        <h1 className="text-xl font-semibold">Auction Results</h1>
        <p className="text-sm text-muted-foreground">
          Record the sold price and buying team for each player. {sold.length} / {auctionablePlayers.length} completed.
        </p>
      </div>

      <AuctionList
        pending={pending}
        sold={sold}
        teams={(teams as Team[]) ?? []}
      />
    </div>
  );
}
