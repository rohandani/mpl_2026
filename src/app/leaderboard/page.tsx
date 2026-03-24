import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { AppHeader } from '@/components/app-header';
import { LeaderboardTable } from './leaderboard-table';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_points: number;
  predictions_count: number;
  correct_teams: number;
}

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data, error } = await supabase.rpc('get_leaderboard');
  const entries: LeaderboardEntry[] = (data as LeaderboardEntry[]) ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showAdmin={isAdmin(user)} />
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-2xl">
          {error && (
            <p className="text-sm text-destructive">Failed to load leaderboard.</p>
          )}
          <LeaderboardTable entries={entries} currentUserId={user.id} />
        </div>
      </main>
    </div>
  );
}
