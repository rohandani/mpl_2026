'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type ActionResult = { success: true } | { success: false; error: string };

export async function setPlayerResult(
  playerId: string,
  soldPrice: number,
  soldTeamId: string
): Promise<ActionResult> {
  if (!playerId || !soldTeamId) {
    return { success: false, error: 'Player and team are required.' };
  }
  if (soldPrice < 0 || isNaN(soldPrice)) {
    return { success: false, error: 'Price must be a valid non-negative number.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return { success: false, error: 'Admin access required.' };
  }

  // Upsert into auctions table
  const { data: existing } = await supabase
    .from('auctions')
    .select('id')
    .eq('player_id', playerId)
    .maybeSingle();

  let error;
  if (existing) {
    ({ error } = await supabase
      .from('auctions')
      .update({
        sold_price: soldPrice,
        sold_to_team_id: soldTeamId,
        status: 'sold',
        ended_at: new Date().toISOString(),
      })
      .eq('id', existing.id));
  } else {
    ({ error } = await supabase.from('auctions').insert({
      player_id: playerId,
      sold_price: soldPrice,
      sold_to_team_id: soldTeamId,
      status: 'sold',
      ended_at: new Date().toISOString(),
    }));
  }

  if (error) return { success: false, error: error.message };

  // Also update the player's team_id to the buying team
  await supabase
    .from('players')
    .update({ team_id: soldTeamId })
    .eq('id', playerId);

  revalidatePath('/predictions');
  revalidatePath('/admin/auctions');
  revalidatePath('/admin/players');
  revalidatePath('/admin/teams');
  return { success: true };
}
