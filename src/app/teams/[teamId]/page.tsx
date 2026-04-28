import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { AppHeader } from '@/components/app-header';
import { TeamRoster } from '@/components/team-roster';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (!team) notFound();

  const { data } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .order('is_captain', { ascending: false });

  const players: Player[] = data ?? [];

  const playerIds = players.map((p) => p.id);
  const { data: auctions } = playerIds.length
    ? await supabase
        .from('auctions')
        .select('player_id, sold_price')
        .in('player_id', playerIds)
        .not('sold_price', 'is', null)
    : { data: [] };

  const soldPriceMap: Record<string, number> = {};
  for (const a of auctions ?? []) {
    soldPriceMap[a.player_id] = a.sold_price!;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showAdmin={isAdmin(user)} />
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <Link
            href="/teams"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All Teams
          </Link>
          <TeamRoster team={team as Team} players={players} soldPriceMap={soldPriceMap} />
        </div>
      </main>
    </div>
  );
}
