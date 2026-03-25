'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type ActionResult = { success: true } | { success: false; error: string };

export async function createFixture(
  teamAId: string,
  teamBId: string,
  matchDate: string,
  venue: string | null
): Promise<ActionResult> {
  if (!teamAId || !teamBId) {
    return { success: false, error: 'Both teams are required.' };
  }
  if (teamAId === teamBId) {
    return { success: false, error: 'Teams must be different.' };
  }
  if (!matchDate) {
    return { success: false, error: 'Match date is required.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return { success: false, error: 'Admin access required.' };
  }

  const { error } = await supabase.from('fixtures').insert({
    team_a_id: teamAId,
    team_b_id: teamBId,
    match_date: matchDate,
    venue: venue?.trim() || null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/fixtures');
  revalidatePath('/fixtures');
  return { success: true };
}

export async function updateFixture(
  fixtureId: string,
  data: {
    team_a_id?: string;
    team_b_id?: string;
    match_date?: string;
    venue?: string | null;
    status?: 'upcoming' | 'live' | 'completed';
  }
): Promise<ActionResult> {
  if (!fixtureId) {
    return { success: false, error: 'Fixture ID is required.' };
  }
  if (data.team_a_id && data.team_b_id && data.team_a_id === data.team_b_id) {
    return { success: false, error: 'Teams must be different.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return { success: false, error: 'Admin access required.' };
  }

  const { error } = await supabase
    .from('fixtures')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', fixtureId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/fixtures');
  revalidatePath('/fixtures');
  return { success: true };
}

export async function submitFixtureResult(
  fixtureId: string,
  winningTeamId: string,
  momPlayerId: string,
  highestScorerId: string,
  highestWicketTakerId: string
): Promise<ActionResult> {
  if (!fixtureId) {
    return { success: false, error: 'Fixture ID is required.' };
  }
  if (!winningTeamId) {
    return { success: false, error: 'Winning team is required.' };
  }
  if (!momPlayerId) {
    return { success: false, error: 'Man of the match is required.' };
  }
  if (!highestScorerId) {
    return { success: false, error: 'Highest scorer is required.' };
  }
  if (!highestWicketTakerId) {
    return { success: false, error: 'Highest wicket taker is required.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return { success: false, error: 'Admin access required.' };
  }

  const { error } = await supabase
    .from('fixtures')
    .update({
      status: 'completed',
      winning_team_id: winningTeamId,
      mom_player_id: momPlayerId,
      highest_scorer_id: highestScorerId,
      highest_wicket_taker_id: highestWicketTakerId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', fixtureId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/fixtures');
  revalidatePath('/fixtures');
  revalidatePath('/leaderboard');
  return { success: true };
}
