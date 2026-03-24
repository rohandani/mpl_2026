import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { AppHeader } from '@/components/app-header';
import { TeamRoster } from '@/components/team-roster';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

export default async function TeamsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: teams } = await supabase.from('teams').select('*');
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .order('is_captain', { ascending: false });

  const playersByTeam = new Map<string, Player[]>();
  for (const p of (players ?? []) as Player[]) {
    if (!p.team_id) continue;
    const list = playersByTeam.get(p.team_id) ?? [];
    list.push(p);
    playersByTeam.set(p.team_id, list);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showAdmin={isAdmin(user)} />
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-5xl space-y-8">
          {((teams ?? []) as Team[]).map((team) => (
            <TeamRoster
              key={team.id}
              team={team}
              players={playersByTeam.get(team.id) ?? []}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
