import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { AppHeader } from '@/components/app-header';
import { PredictionsShell } from './predictions-shell';
import type { PlayerWithPrediction, Auction } from '@/types/prediction';
import type { Team } from '@/types/team';
import type { ShareConfig } from '@/types/share-config';
import type { Sponsor } from '@/types/sponsor';

export default async function PredictionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [
    { data: players },
    { data: auctions },
    { data: predictions },
    { data: teams },
    { data: shareConfig },
    { data: sponsors },
  ] = await Promise.all([
    supabase.from('players').select('id, name, role, base_price, is_captain, team_id').eq('is_captain', false).order('name'),
    supabase.from('auctions').select('*'),
    supabase.from('predictions').select('*').eq('user_id', user.id),
    supabase.from('teams').select('*'),
    supabase.from('share_config').select('*').eq('id', 'default').single(),
    supabase.from('sponsors').select('name, logo_url').eq('is_active', true).order('display_order'),
  ]);

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

  const totalPlayers = playersWithPredictions.length;
  const totalPredicted = playersWithPredictions.filter((p) => p.prediction).length;
  const displayName = user.user_metadata?.full_name ?? user.email ?? 'Player';

  const config = shareConfig as ShareConfig | null;

  const activeSponsorList = ((sponsors as Sponsor[]) ?? []);
  const sponsorNames = activeSponsorList.map((s) => s.name);
  const sponsorLogos = activeSponsorList.map((s) => s.logo_url);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        showAdmin={isAdmin(user)}
        shareCardData={{
          userName: displayName,
          title: config?.title,
          customHashtags: config?.hashtags,
          sponsorNames,
          sponsorLogos,
          predictionsText: `${totalPredicted} / ${totalPlayers}`,
          tagline: 'Think you can beat me? Join now!',
        }}
      />
      <main className="flex-1 px-4 py-6">
        <PredictionsShell
          players={playersWithPredictions}
          teams={(teams as Team[]) ?? []}
        />
      </main>
    </div>
  );
}
