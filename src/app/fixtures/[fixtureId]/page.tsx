import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { isPredictionOpen } from '@/lib/scoring';
import { AppHeader } from '@/components/app-header';
import { MatchPredictionForm } from './match-prediction-form';
import { MatchLeaderboard } from './match-leaderboard';
import type { Fixture, MatchPrediction, MatchSettings } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';
import Image from 'next/image';

interface Props {
  params: Promise<{ fixtureId: string }>;
}

export default async function FixtureDetailPage({ params }: Props) {
  const { fixtureId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [
    { data: fixture },
    { data: teams },
    { data: prediction },
    { data: settings },
  ] = await Promise.all([
    supabase.from('fixtures').select('*').eq('id', fixtureId).single(),
    supabase.from('teams').select('*'),
    supabase
      .from('match_predictions')
      .select('*')
      .eq('user_id', user.id)
      .eq('fixture_id', fixtureId)
      .maybeSingle(),
    supabase.from('match_settings').select('*').eq('id', 'default').single(),
  ]);

  if (!fixture) notFound();

  const f = fixture as Fixture;
  const teamsList = (teams as Team[]) ?? [];
  const teamA = teamsList.find((t) => t.id === f.team_a_id);
  const teamB = teamsList.find((t) => t.id === f.team_b_id);
  const matchSettings = settings as MatchSettings;

  // Fetch players for both teams
  const { data: players } = await supabase
    .from('players')
    .select('id, name, role, team_id')
    .in('team_id', [f.team_a_id, f.team_b_id])
    .order('name');

  const teamPlayers = (players as Pick<Player, 'id' | 'name' | 'role' | 'team_id'>[]) ?? [];
  const deadlineMinutes = matchSettings?.prediction_deadline_minutes ?? 15;
  const open = isPredictionOpen(f, deadlineMinutes);

  // Fetch match leaderboard for completed fixtures
  let leaderboard: {
    user_id: string;
    display_name: string;
    team_win_points: number;
    mom_points: number;
    highest_scorer_points: number;
    highest_wicket_taker_points: number;
    total_points: number;
  }[] = [];

  if (f.status === 'completed') {
    const { data } = await supabase.rpc('get_match_leaderboard', {
      p_fixture_id: fixtureId,
    });
    leaderboard = data ?? [];
  }

  const deadline = new Date(f.match_date);
  deadline.setMinutes(deadline.getMinutes() - deadlineMinutes);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showAdmin={isAdmin(user)} />
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Back to fixtures */}
          <Link
            href="/fixtures"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Fixtures
          </Link>

          {/* Fixture header */}
          <div className="rounded-xl ring-1 ring-border overflow-hidden">
            <div
              className="h-1.5"
              style={{
                background:
                  f.status === 'completed'
                    ? 'linear-gradient(to right, #f59e0b, #10b981)'
                    : 'linear-gradient(to right, #3b82f6, #8b5cf6)',
              }}
            />
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Match #{f.match_number}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    f.status === 'completed'
                      ? 'bg-amber-100 text-amber-800'
                      : f.status === 'live'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                </span>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-2 flex-1">
                  {teamA?.logo && (
                    <Image src={teamA.logo} alt={teamA.name} width={48} height={48} />
                  )}
                  <span className="text-sm font-semibold text-center">{teamA?.name ?? 'TBD'}</span>
                </div>
                <span className="text-lg font-bold text-muted-foreground">vs</span>
                <div className="flex flex-col items-center gap-2 flex-1">
                  {teamB?.logo && (
                    <Image src={teamB.logo} alt={teamB.name} width={48} height={48} />
                  )}
                  <span className="text-sm font-semibold text-center">{teamB?.name ?? 'TBD'}</span>
                </div>
              </div>

              {/* Date & venue */}
              <div className="text-center text-sm text-muted-foreground space-y-0.5">
                <p>📅 {new Date(f.match_date).toLocaleString()}</p>
                {f.venue && <p>📍 {f.venue}</p>}
              </div>

              {/* Results for completed */}
              {f.status === 'completed' && (
                <div className="rounded-lg bg-muted/60 p-3 space-y-1 text-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Match Results
                  </p>
                  <p>
                    🏆 Winner:{' '}
                    <span className="font-medium">
                      {teamsList.find((t) => t.id === f.winning_team_id)?.name ?? '—'}
                    </span>
                  </p>
                  <p>
                    ⭐ MoM:{' '}
                    <span className="font-medium">
                      {teamPlayers.find((p) => p.id === f.mom_player_id)?.name ?? '—'}
                    </span>
                  </p>
                  <p>
                    🏏 Highest Scorer:{' '}
                    <span className="font-medium">
                      {teamPlayers.find((p) => p.id === f.highest_scorer_id)?.name ?? '—'}
                    </span>
                  </p>
                  <p>
                    🎳 Highest Wicket Taker:{' '}
                    <span className="font-medium">
                      {teamPlayers.find((p) => p.id === f.highest_wicket_taker_id)?.name ?? '—'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Prediction form (for non-completed fixtures) */}
          {f.status !== 'completed' && (
            <MatchPredictionForm
              fixture={f}
              teamA={teamA ?? null}
              teamB={teamB ?? null}
              players={teamPlayers}
              prediction={(prediction as MatchPrediction) ?? null}
              isPredictionOpen={open}
              deadlineDate={deadline.toISOString()}
            />
          )}

          {/* Match leaderboard (for completed fixtures) */}
          {f.status === 'completed' && (
            <MatchLeaderboard
              leaderboard={leaderboard}
              currentUserId={user.id}
              prediction={(prediction as MatchPrediction) ?? null}
              fixture={f}
              settings={matchSettings}
            />
          )}
        </div>
      </main>
    </div>
  );
}
