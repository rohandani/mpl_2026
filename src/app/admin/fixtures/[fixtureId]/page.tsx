import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { AppHeader } from '@/components/app-header';
import { PlayersToWatchManagerWrapper } from './players-to-watch-wrapper';

interface Props {
  params: Promise<{ fixtureId: string }>;
}

export default async function AdminFixtureDetailPage({ params }: Props) {
  const { fixtureId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user)) {
    redirect('/login');
  }

  const [
    { data: fixture },
    { data: teams },
    { data: players },
    { data: playersToWatch },
  ] = await Promise.all([
    supabase.from('fixtures').select('*').eq('id', fixtureId).single(),
    supabase.from('teams').select('id, name').order('name'),
    supabase.from('players').select('id, name, role, team_id').order('name'),
    supabase
      .from('players_to_watch')
      .select(`
        *,
        player:players(id, name, role, team_id)
      `)
      .eq('fixture_id', fixtureId)
      .order('sort_order'),
  ]);

  if (!fixture) {
    notFound();
  }

  const teamA = teams?.find((t) => t.id === fixture.team_a_id);
  const teamB = teams?.find((t) => t.id === fixture.team_b_id);
  const fixtureTeams = [teamA, teamB].filter(Boolean) as { id: string; name: string }[];

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showAdmin={true} />
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <Link
              href="/admin/fixtures"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Fixtures
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                {fixture.stage}: {teamA?.name} vs {teamB?.name}
              </h1>
              <p className="text-muted-foreground">
                Manage players to watch and match highlights
              </p>
            </div>
          </div>

          {/* Match Info */}
          <div className="rounded-lg border p-4 bg-muted/30">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Date:</span>{' '}
                {new Date(fixture.match_date).toLocaleString()}
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{' '}
                <span className={`capitalize px-2 py-0.5 rounded-full text-xs ${
                  fixture.status === 'completed' ? 'bg-green-100 text-green-800' :
                  fixture.status === 'live' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {fixture.status}
                </span>
              </div>
              {fixture.venue && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Venue:</span> {fixture.venue}
                </div>
              )}
            </div>
          </div>

          {/* Players to Watch Manager */}
          <PlayersToWatchManagerWrapper
            fixtureId={fixtureId}
            players={players ?? []}
            teams={fixtureTeams}
            initialPlayersToWatch={(playersToWatch as any[]) ?? []}
          />
        </div>
      </main>
    </div>
  );
}