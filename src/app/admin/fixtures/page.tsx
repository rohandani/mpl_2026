import { createClient } from '@/lib/supabase/server';
import { FixtureAdminList } from './fixture-admin-list';
import type { Fixture, MatchPrediction } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

export default async function FixturesPage() {
  const supabase = await createClient();

  const { data: fixtures } = await supabase
    .from('fixtures')
    .select('*')
    .order('match_date', { ascending: true });

  const { data: teams } = await supabase.from('teams').select('*');
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .order('name');

  // Get all match predictions
  const { data: matchPredictions } = await supabase
    .from('match_predictions')
    .select('*')
    .order('created_at', { ascending: false });

  // Get user profiles for display names
  const userIds = [...new Set((matchPredictions ?? []).map(p => p.user_id))];
  const { data: profiles } = userIds.length > 0 ? await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds) : { data: [] };

  // Combine the data
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));
  const enrichedPredictions = (matchPredictions ?? []).map(p => ({
    ...p,
    profiles: profileMap.get(p.user_id) || null
  }));

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
        matchPredictions={enrichedPredictions ?? []}
      />
    </div>
  );
}
