import { createClient } from '@/lib/supabase/server';
import { FixtureAdminList } from './fixture-admin-list';
import type { Fixture } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

export default async function FixturesPage() {
  const supabase = await createClient();

  const { data: fixtures } = await supabase
    .from('fixtures')
    .select('*')
    .order('match_number', { ascending: true });

  const { data: teams } = await supabase.from('teams').select('*');
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .order('name');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Fixtures</h1>
        <p className="text-sm text-muted-foreground">
          Manage tournament fixtures. {(fixtures ?? []).length} fixture(s) created.
        </p>
      </div>

      <FixtureAdminList
        fixtures={(fixtures as Fixture[]) ?? []}
        teams={(teams as Team[]) ?? []}
        players={(players as Player[]) ?? []}
      />
    </div>
  );
}
