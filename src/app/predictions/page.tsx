import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { SignOutButton } from '@/components/sign-out-button';
import { PredictionsShell } from './predictions-shell';
import type { PlayerWithPrediction, Auction } from '@/types/prediction';
import type { Team } from '@/types/team';

export default async function PredictionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch players (exclude captains — they're pre-assigned, not auctioned)
  const { data: players } = await supabase
    .from('players')
    .select('id, name, role, base_price, is_captain, team_id')
    .eq('is_captain', false)
    .order('name');

  // Fetch auctions
  const { data: auctions } = await supabase
    .from('auctions')
    .select('*');

  // Fetch user's predictions
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id);

  // Fetch teams
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
      <header className="border-b border-primary/30 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/mpl-logo.png" alt="MPL 2026 logo" width={32} height={32} />
            <span className="text-lg font-semibold">
              MPL <span className="text-primary">2026</span> — Predictions
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            {isAdmin(user) && (
              <Link
                href="/admin"
                className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted"
              >
                Admin
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 py-6">
        <PredictionsShell
          players={playersWithPredictions}
          teams={(teams as Team[]) ?? []}
          isAdmin={isAdmin(user)}
        />
      </main>
    </div>
  );
}
