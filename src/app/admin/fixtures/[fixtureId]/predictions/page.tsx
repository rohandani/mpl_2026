import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnalyticsWithToggle } from './analytics-with-toggle';
import { PredictionDetailsTable } from './prediction-details-table';
import type { MatchPrediction } from '@/types/fixture';
import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

interface MatchPredictionWithProfile extends MatchPrediction {
  profiles: { display_name: string | null } | null;
}

interface Props {
  params: Promise<{ fixtureId: string }>;
}

export default async function FixturePredictionsPage({ params }: Props) {
  const { fixtureId } = await params;
  const supabase = await createClient();

  // Get fixture details
  const { data: fixture } = await supabase
    .from('fixtures')
    .select('*')
    .eq('id', fixtureId)
    .single();

  if (!fixture) {
    notFound();
  }

  // Get teams and players
  const [{ data: teams }, { data: players }] = await Promise.all([
    supabase.from('teams').select('*'),
    supabase.from('players').select('*').order('name')
  ]);

  // Get match predictions for this fixture
  const { data: matchPredictions } = await supabase
    .from('match_predictions')
    .select('*')
    .eq('fixture_id', fixtureId)
    .order('created_at', { ascending: false });

  // Get user profiles for display names
  const userIds = [...new Set((matchPredictions ?? []).map(p => p.user_id))];
  const { data: profiles } = userIds.length > 0 ? await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds) : { data: [] };

  // Combine the data
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));
  const enrichedPredictions: MatchPredictionWithProfile[] = (matchPredictions ?? []).map(p => ({
    ...p,
    profiles: profileMap.get(p.user_id) || null
  }));

  const teamMap = new Map((teams ?? []).map(t => [t.id, t]));
  const teamA = teamMap.get(fixture.team_a_id);
  const teamB = teamMap.get(fixture.team_b_id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/fixtures">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Fixtures
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Match Predictions Analytics</h1>
                <p className="text-muted-foreground">
                  {fixture.stage}: {teamA?.name} vs {teamB?.name} ({enrichedPredictions.length} predictions)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {enrichedPredictions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No predictions submitted for this match yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Analytics Charts with Toggle */}
            <AnalyticsWithToggle 
              predictions={enrichedPredictions}
              teams={(teams as Team[]) ?? []}
              players={(players as Player[]) ?? []}
            />
            
            {/* Detailed Table */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Detailed Predictions</h2>
              <PredictionDetailsTable 
                predictions={enrichedPredictions}
                teams={(teams as Team[]) ?? []}
                players={(players as Player[]) ?? []}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}