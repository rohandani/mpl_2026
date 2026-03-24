import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { TeamRoster } from '@/components/team-roster';
import teams from '@/data/teams.json';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const team = (teams as Team[]).find((t) => t.id === teamId);
  if (!team) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .order('is_captain', { ascending: false });

  const players: Player[] = data ?? [];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/teams"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Teams
      </Link>

      <TeamRoster team={team} players={players} />
    </div>
  );
}
