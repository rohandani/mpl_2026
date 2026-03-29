import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { AppHeader } from '@/components/app-header';
import { AuctionRace } from './auction-race';
import teams from '@/data/teams.json';

export interface TeamVote {
    team_name: string;
    team_color: string;
    team_logo: string;
    captain_name: string;
    votes: number;
    pct: number;
}

export interface RacePlayer {
    rank: number;
    name: string;
    role: string;
    photo_url: string | null;
    predicted_team: string;
    team_color: string;
    prediction_count: number;
    team_votes: TeamVote[];
}

export default async function AuctionHeatmapPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/login');
    if (!isAdmin(user)) redirect('/');

    // Fetch all predictions with player info, and captains for team labels
    const [predRes, captainRes] = await Promise.all([
        supabase
            .from('predictions')
            .select('player_id, predicted_price, predicted_team_id, player:players(name, role, photo_url)'),
        supabase
            .from('players')
            .select('name, team_id')
            .eq('is_captain', true),
    ]);

    const { data: predictions, error } = predRes;

    if (error || captainRes.error) {
        return (
            <div className="flex min-h-screen flex-col">
                <AppHeader showAdmin />
                <main className="flex-1 px-4 py-6">
                    <p className="text-sm text-destructive">Failed to load predictions.</p>
                </main>
            </div>
        );
    }

    // Aggregate: sum of all predicted prices per player
    const playerAgg = new Map<
        string,
        {
            name: string;
            role: string;
            photo_url: string | null;
            totalPredicted: number;
            count: number;
            teamVotes: Map<string, number>;
        }
    >();

    for (const row of predictions ?? []) {
        const player = row.player as unknown as { name: string; role: string; photo_url: string | null } | null;
        const existing = playerAgg.get(row.player_id);
        if (existing) {
            existing.totalPredicted += row.predicted_price;
            existing.count += 1;
            existing.teamVotes.set(
                row.predicted_team_id,
                (existing.teamVotes.get(row.predicted_team_id) ?? 0) + 1,
            );
        } else {
            const votes = new Map<string, number>();
            votes.set(row.predicted_team_id, 1);
            playerAgg.set(row.player_id, {
                name: player?.name ?? 'Unknown',
                role: player?.role ?? '',
                photo_url: player?.photo_url ?? null,
                totalPredicted: row.predicted_price,
                count: 1,
                teamVotes: votes,
            });
        }
    }

    const teamMap = new Map(teams.map((t) => [t.id, t]));

    // Build captain map: team_id → captain name
    const captainMap = new Map<string, string>();
    for (const c of captainRes.data ?? []) {
        if (c.team_id) captainMap.set(c.team_id, c.name);
    }

    // Sort by total predicted price (most hyped), take top 5
    const top5 = [...playerAgg.values()]
        .sort((a, b) => b.totalPredicted - a.totalPredicted)
        .slice(0, 5);

    const topPlayers: RacePlayer[] = top5.map((p, i) => {
        // Sort team votes descending
        const sortedVotes = [...p.teamVotes.entries()].sort(
            (a, b) => b[1] - a[1],
        );
        const topTeamId = sortedVotes[0]?.[0];
        const team = teamMap.get(topTeamId ?? '');

        const teamVotes: TeamVote[] = sortedVotes.map(([teamId, votes]) => {
            const t = teamMap.get(teamId);
            return {
                team_name: t?.name ?? 'Unknown',
                team_color: t?.color ?? '#94a3b8',
                team_logo: t?.logo ?? '',
                captain_name: captainMap.get(teamId) ?? '',
                votes,
                pct: Math.round((votes / p.count) * 100),
            };
        });

        return {
            rank: i + 1,
            name: p.name,
            role: p.role,
            photo_url: p.photo_url,
            predicted_team: team?.name ?? 'Unknown',
            team_color: team?.color ?? '#94a3b8',
            prediction_count: p.count,
            team_votes: teamVotes,
        };
    });

    return (
        <div className="flex min-h-screen flex-col">
            <AppHeader showAdmin />
            <main className="flex-1 px-4 py-6">
                <div className="mx-auto max-w-4xl">
                    <AuctionRace players={topPlayers} />
                </div>
            </main>
        </div>
    );
}
