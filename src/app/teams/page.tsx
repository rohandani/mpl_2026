import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { AppHeader } from '@/components/app-header';
import { TeamCard } from '@/components/team-card';
import type { Team } from '@/types/team';

export default async function TeamsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: teams } = await supabase.from('teams').select('*');

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showAdmin={isAdmin(user)} />
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-xl font-semibold">Teams</h1>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {((teams ?? []) as Team[]).map((team) => (
              <TeamCard key={team.id} team={team} href={`/teams/${team.id}`} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
