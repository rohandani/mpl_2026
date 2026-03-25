import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { AppHeader } from '@/components/app-header';
import { FixturesList } from './fixtures-list';
import type { Fixture, MatchPrediction, MatchSettings } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

export default async function FixturesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [
    { data: fixtures },
    { data: teams },
    { data: predictions },
    { data: settings },
    { data: players },
  ] = await Promise.all([
    supabase.from('fixtures').select('*').order('match_date', { ascending: true }),
    supabase.from('teams').select('*'),
    supabase.from('match_predictions').select('*').eq('user_id', user.id),
    supabase.from('match_settings').select('*').eq('id', 'default').single(),
    supabase.from('players').select('id, name').order('name'),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showAdmin={isAdmin(user)} />
      <main className="flex-1 px-4 py-6">
        <FixturesList
          fixtures={(fixtures as Fixture[]) ?? []}
          teams={(teams as Team[]) ?? []}
          players={(players as Pick<Player, 'id' | 'name'>[]) ?? []}
          predictions={(predictions as MatchPrediction[]) ?? []}
          settings={settings as MatchSettings}
        />
      </main>
    </div>
  );
}
