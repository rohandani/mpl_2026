import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { SignOutButton } from '@/components/sign-out-button';
import { TeamRoster } from '@/components/team-roster';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

export default async function TeamsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: teams } = await supabase.from('teams').select('*');
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .order('is_captain', { ascending: false });

  const playersByTeam = new Map<string, Player[]>();
  for (const p of (players ?? []) as Player[]) {
    if (!p.team_id) continue;
    const list = playersByTeam.get(p.team_id) ?? [];
    list.push(p);
    playersByTeam.set(p.team_id, list);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-primary/30 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/mpl-logo.png" alt="MPL 2026 logo" width={32} height={32} />
            <span className="text-lg font-semibold">
              MPL <span className="text-primary">2026</span> — Teams
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            {isAdmin(user) && (
              <Link
                href="/admin"
                className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted"
              >
                Admin
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-5xl space-y-8">
          {((teams ?? []) as Team[]).map((team) => (
            <TeamRoster
              key={team.id}
              team={team}
              players={playersByTeam.get(team.id) ?? []}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
