'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type ActionResult = { success: true } | { success: false; error: string };

export async function updateMatchSettings(
  deadlineMinutes: number,
  pointsTeamWin: number,
  pointsMom: number,
  pointsHighestScorer: number,
  pointsHighestWicketTaker: number
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return { success: false, error: 'Admin access required.' };
  }

  if (deadlineMinutes < 0) {
    return { success: false, error: 'Deadline minutes must be non-negative.' };
  }

  if ([pointsTeamWin, pointsMom, pointsHighestScorer, pointsHighestWicketTaker].some((v) => v < 0)) {
    return { success: false, error: 'Point values must be non-negative.' };
  }

  const { error } = await supabase
    .from('match_settings')
    .update({
      prediction_deadline_minutes: deadlineMinutes,
      points_team_win: pointsTeamWin,
      points_mom: pointsMom,
      points_highest_scorer: pointsHighestScorer,
      points_highest_wicket_taker: pointsHighestWicketTaker,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'default');

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/match-settings');
  return { success: true };
}
