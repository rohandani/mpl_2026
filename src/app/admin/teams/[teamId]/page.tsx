import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import teams from '@/data/teams.json';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const team = (teams as Team[]).find((t) => t.id === teamId);
  if (!team) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .order('is_captain', { ascending: false });

  const players: Player[] = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/teams"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Teams
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={{ backgroundColor: `${team.color}20` }}
        >
          <Image
            src={team.logo}
            alt={`${team.name} logo`}
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="text-xl font-semibold">{team.name}</h1>
          <p className="text-sm text-muted-foreground">
            {players.length} {players.length === 1 ? 'player' : 'players'}
          </p>
        </div>
      </div>

      {players.length === 0 ? (
        <p className="text-sm text-muted-foreground">No players assigned to this team yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <Card key={player.id} className="pt-0">
              <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: team.color }} />
              <CardContent className="space-y-3 pt-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{player.name}</span>
                      {player.is_captain && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          Captain
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{player.role}</p>
                  </div>
                </div>
                <div className="text-sm font-medium">${player.base_price} CAD</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
