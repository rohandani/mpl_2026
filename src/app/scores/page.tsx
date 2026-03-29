import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { AppHeader } from '@/components/app-header';
import { ScoresTable } from './scores-table';
import type { Auction } from '@/types/prediction';
import type { Team } from '@/types/team';

export interface ScoreRow {
  playerName: string;
  role: string;
  basePrice: number;
  predictedPrice: number;
  predictedTeamName: string;
  predictedTeamColor: string;
  soldPrice: number | null;
  soldTeamName: string | null;
  soldTeamColor: string | null;
  teamPoints: number;
  pricePoints: number;
  totalPoints: number;
  hasResult: boolean;
}

interface Props {
  searchParams: Promise<{ user?: string; name?: string }>;
}

export default async function ScoresPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const params = await searchParams;
  const targetUserId = params.user || user.id;
  const isOwnScores = targetUserId === user.id;
  const displayName = params.name || user.user_metadata?.full_name || user.email || 'You';

  // If viewing another user's scores, use the RPC (bypasses RLS)
  // If viewing own scores, use direct queries (faster, no RPC needed)
  const { data: teams } = await supabase.from('teams').select('*');
  const teamMap = new Map(((teams as Team[]) ?? []).map((t) => [t.id, t]));

  let rows: ScoreRow[] = [];
  let totalScore = 0;
  let resultsOut = 0;
  let correctTeams = 0;

  if (!isOwnScores) {
    // Use RPC for other users
    const { data: scores } = await supabase.rpc('get_user_scores', {
      target_user_id: targetUserId,
    });

    rows = ((scores ?? []) as {
      player_name: string;
      player_role: string;
      base_price: number;
      predicted_price: number;
      predicted_team_id: string;
      sold_price: number;
      sold_to_team_id: string;
      team_points: number;
      price_points: number;
      total_points: number;
    }[]).map((s) => {
      const predTeam = teamMap.get(s.predicted_team_id);
      const soldTeam = teamMap.get(s.sold_to_team_id);
      resultsOut++;
      if (s.team_points > 0) correctTeams++;
      totalScore += s.total_points;
      return {
        playerName: s.player_name,
        role: s.player_role,
        basePrice: s.base_price,
        predictedPrice: s.predicted_price,
        predictedTeamName: predTeam?.name ?? '?',
        predictedTeamColor: predTeam?.color ?? '#94a3b8',
        soldPrice: s.sold_price,
        soldTeamName: soldTeam?.name ?? null,
        soldTeamColor: soldTeam?.color ?? null,
        teamPoints: s.team_points,
        pricePoints: s.price_points,
        totalPoints: s.total_points,
        hasResult: true,
      };
    });
    totalScore = Math.round(totalScore * 10) / 10;
  } else {
    // Own scores — direct queries
    const [{ data: players }, { data: auctions }, { data: predictions }] =
      await Promise.all([
        supabase.from('players').select('id, name, role, base_price').eq('is_captain', false).order('name'),
        supabase.from('auctions').select('*'),
        supabase.from('predictions').select('*').eq('user_id', user.id),
      ]);

    const auctionMap = new Map(((auctions as Auction[]) ?? []).map((a) => [a.player_id, a]));
    const predMap = new Map(
      (predictions ?? []).map((p: { player_id: string; predicted_price: number; predicted_team_id: string }) => [p.player_id, p]),
    );

    rows = ((players ?? []) as { id: string; name: string; role: string; base_price: number }[])
      .filter((p) => predMap.has(p.id))
      .map((p) => {
        const pred = predMap.get(p.id)!;
        const auction = auctionMap.get(p.id);
        const hasResult = auction?.sold_price != null;
        const predTeam = teamMap.get(pred.predicted_team_id);
        const soldTeam = auction?.sold_to_team_id ? teamMap.get(auction.sold_to_team_id) : null;

        let teamPts = 0;
        let pricePts = 0;

        if (hasResult) {
          resultsOut++;
          teamPts = pred.predicted_team_id === auction!.sold_to_team_id ? 20 : 0;
          if (teamPts > 0) correctTeams++;
          const actual = auction!.sold_price!;
          const pctOff = actual === 0 ? (pred.predicted_price === 0 ? 0 : 1) : Math.abs(pred.predicted_price - actual) / actual;
          pricePts = Math.round(Math.max(0, Math.min(30, 30 - pctOff * 100)) * 10) / 10;
          totalScore += teamPts + pricePts;
        }

        return {
          playerName: p.name,
          role: p.role,
          basePrice: p.base_price,
          predictedPrice: pred.predicted_price,
          predictedTeamName: predTeam?.name ?? '?',
          predictedTeamColor: predTeam?.color ?? '#94a3b8',
          soldPrice: auction?.sold_price ?? null,
          soldTeamName: soldTeam?.name ?? null,
          soldTeamColor: soldTeam?.color ?? null,
          teamPoints: teamPts,
          pricePoints: pricePts,
          totalPoints: Math.round((teamPts + pricePts) * 10) / 10,
          hasResult,
        };
      });
    totalScore = Math.round(totalScore * 10) / 10;
  }

  const heading = isOwnScores ? 'My' : `${displayName}'s`;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showAdmin={isAdmin(user)} />
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-5xl space-y-4">
          {!isOwnScores && (
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Leaderboard
            </Link>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">
              📊 {heading} <span className="text-primary">Scores</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {isOwnScores
                ? 'All your predictions at a glance with score breakdown.'
                : `Viewing ${displayName}'s auction prediction scores.`}
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-white p-3 ring-1 ring-border text-center">
              <p className="text-2xl font-bold text-primary">{totalScore}</p>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-border text-center">
              <p className="text-2xl font-bold">{rows.length}</p>
              <p className="text-xs text-muted-foreground">Predictions</p>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-border text-center">
              <p className="text-2xl font-bold">{resultsOut}</p>
              <p className="text-xs text-muted-foreground">Results Out</p>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-border text-center">
              <p className="text-2xl font-bold text-emerald-600">{correctTeams}</p>
              <p className="text-xs text-muted-foreground">Correct Teams</p>
            </div>
          </div>

          <ScoresTable rows={rows} />
        </div>
      </main>
    </div>
  );
}
