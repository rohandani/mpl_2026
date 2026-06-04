import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { AppHeader } from '@/components/app-header';
import { LeaderboardTable } from './leaderboard-table';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

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

export interface UserMatchDetail {
  user_id: string;
  display_name: string;
  fixture_id: string;
  match_number: number;
  team_a_id: string;
  team_b_id: string;
  match_date: string;
  winning_team_id: string | null;
  mom_player_id: string | null;
  highest_scorer_id: string | null;
  highest_wicket_taker_id: string | null;
  predicted_winner_id: string | null;
  predicted_mom_id: string | null;
  predicted_highest_scorer_id: string | null;
  predicted_highest_wicket_taker_id: string | null;
  team_win_points: number;
  mom_points: number;
  highest_scorer_points: number;
  highest_wicket_taker_points: number;
  total_points: number;
}

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [auctionRes, overallRes, matchDetailsRes, teamsRes, playersRes] = await Promise.all([
    supabase.rpc('get_leaderboard'),
    supabase.rpc('get_overall_leaderboard'),
    supabase.rpc('get_all_user_match_details'),
    supabase.from('teams').select('*'),
    supabase.from('players').select('id, name, role, team_id').order('name'),
  ]);

  const auctionEntries: AuctionLeaderboardEntry[] =
    (auctionRes.data as AuctionLeaderboardEntry[]) ?? [];
  const overallEntries: OverallLeaderboardEntry[] =
    (overallRes.data as OverallLeaderboardEntry[]) ?? [];
  const matchDetails: UserMatchDetail[] =
    (matchDetailsRes.data as UserMatchDetail[]) ?? [];
  const teams: Team[] = (teamsRes.data as Team[]) ?? [];
  const players: Pick<Player, 'id' | 'name' | 'role' | 'team_id'>[] =
    (playersRes.data as Pick<Player, 'id' | 'name' | 'role' | 'team_id'>[]) ?? [];

  const hasError = auctionRes.error || overallRes.error;

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
            overallEntries={overallEntries}
            currentUserId={user.id}
            matchDetails={matchDetails}
            teams={teams}
            players={players}
          />
        </div>
      </main>
    </div>
  );
}
