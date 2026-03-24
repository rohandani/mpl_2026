import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { AppHeader } from '@/components/app-header';
import { LeaderboardTable } from './leaderboard-table';

export interface AuctionLeaderboardEntry {
  user_id: string;
  display_name: string;
  total_points: number;
  predictions_count: number;
  correct_teams: number;
}

export interface MatchesLeaderboardEntry {
  user_id: string;
  display_name: string;
  total_points: number;
  matches_predicted: number;
}

export interface OverallLeaderboardEntry {
  user_id: string;
  display_name: string;
  auction_points: number;
  match_points: number;
  total_points: number;
}

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [auctionRes, matchesRes, overallRes] = await Promise.all([
    supabase.rpc('get_leaderboard'),
    supabase.rpc('get_matches_leaderboard'),
    supabase.rpc('get_overall_leaderboard'),
  ]);

  const auctionEntries: AuctionLeaderboardEntry[] =
    (auctionRes.data as AuctionLeaderboardEntry[]) ?? [];
  const matchesEntries: MatchesLeaderboardEntry[] =
    (matchesRes.data as MatchesLeaderboardEntry[]) ?? [];
  const overallEntries: OverallLeaderboardEntry[] =
    (overallRes.data as OverallLeaderboardEntry[]) ?? [];

  const hasError = auctionRes.error || matchesRes.error || overallRes.error;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showAdmin={isAdmin(user)} />
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-2xl">
          {hasError && (
            <p className="text-sm text-destructive">Failed to load leaderboard.</p>
          )}
          <LeaderboardTable
            auctionEntries={auctionEntries}
            matchesEntries={matchesEntries}
            overallEntries={overallEntries}
            currentUserId={user.id}
          />
        </div>
      </main>
    </div>
  );
}
