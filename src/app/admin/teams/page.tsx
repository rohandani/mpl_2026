import { createClient } from '@/lib/supabase/server';
import { TeamCard } from '@/components/team-card';
import type { Team } from '@/types/team';

export default async function TeamsPage() {
  const supabase = await createClient();
  const { data: teams } = await supabase.from('teams').select('*');

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Teams</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {((teams ?? []) as Team[]).map((team) => (
          <TeamCard key={team.id} team={team} href={`/admin/teams/${team.id}`} />
        ))}
      </div>
    </div>
  );
}
