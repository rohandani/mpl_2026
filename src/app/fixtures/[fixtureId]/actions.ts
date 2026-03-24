'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isPredictionOpen } from '@/lib/scoring';
import type { Fixture, MatchSettings } from '@/types/fixture';

type ActionResult = { success: true } | { success: false; error: string };

export async function submitMatchPrediction(
  fixtureId: string,
  winnerId: string | null,
  momId: string | null,
  highestScorerId: string | null,
  highestWicketTakerId: string | null
): Promise<ActionResult> {
  if (!fixtureId) {
    return { success: false, error: 'Fixture ID is required.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated.' };

  // Fetch fixture
  const { data: fixture, error: fixtureError } = await supabase
    .from('fixtures')
    .select('*')
    .eq('id', fixtureId)
    .single();

  if (fixtureError || !fixture) {
    return { success: false, error: 'Fixture not found.' };
  }

  const f = fixture as Fixture;

  // Fetch match settings
  const { data: settings } = await supabase
    .from('match_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  const deadlineMinutes = (settings as MatchSettings | null)?.prediction_deadline_minutes ?? 15;

  // Validate deadline
  if (!isPredictionOpen(f, deadlineMinutes)) {
    return { success: false, error: 'Predictions are closed for this match.' };
  }

  // Validate winner belongs to fixture teams
  if (winnerId && winnerId !== f.team_a_id && winnerId !== f.team_b_id) {
    return { success: false, error: 'Invalid team selection.' };
  }

  // Validate players belong to fixture teams
  if (momId || highestScorerId || highestWicketTakerId) {
    const playerIds = [momId, highestScorerId, highestWicketTakerId].filter(Boolean) as string[];
    if (playerIds.length > 0) {
      const { data: players } = await supabase
        .from('players')
        .select('id, team_id')
        .in('id', playerIds);

      const validTeamIds = [f.team_a_id, f.team_b_id];
      const invalid = (players ?? []).some(
        (p) => !p.team_id || !validTeamIds.includes(p.team_id)
      );
      if (invalid) {
        return { success: false, error: 'Selected player does not belong to either team.' };
      }
    }
  }

  // Upsert prediction
  const { error } = await supabase.from('match_predictions').upsert(
    {
      user_id: user.id,
      fixture_id: fixtureId,
      predicted_winner_id: winnerId || null,
      predicted_mom_id: momId || null,
      predicted_highest_scorer_id: highestScorerId || null,
      predicted_highest_wicket_taker_id: highestWicketTakerId || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,fixture_id' }
  );

  if (error) return { success: false, error: error.message };

  revalidatePath(`/fixtures/${fixtureId}`);
  revalidatePath('/fixtures');
  return { success: true };
}
