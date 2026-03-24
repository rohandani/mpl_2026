import { createClient } from '@/lib/supabase/server';
import { TeamRoster } from '@/components/team-roster';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

export default async function TeamsPage() {
  const supabase = await createClient();

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
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Teams</h1>
      {((teams ?? []) as Team[]).map((team) => (
        <TeamRoster
          key={team.id}
          team={team}
          players={playersByTeam.get(team.id) ?? []}
        />
      ))}
    </div>
  );
}
