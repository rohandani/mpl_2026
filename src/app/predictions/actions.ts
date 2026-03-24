'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type ActionResult = { success: true } | { success: false; error: string };

export async function submitPrediction(
  playerId: string,
  predictedPrice: number,
  predictedTeamId: string
): Promise<ActionResult> {
  if (!playerId || !predictedTeamId) {
    return { success: false, error: 'Player and team are required.' };
  }
  if (predictedPrice < 0 || isNaN(predictedPrice)) {
    return { success: false, error: 'Price must be a valid non-negative number.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated.' };

  // Check if auction result is already out for this player
  const { data: auction } = await supabase
    .from('auctions')
    .select('sold_price')
    .eq('player_id', playerId)
    .not('sold_price', 'is', null)
    .maybeSingle();

  if (auction) {
    return { success: false, error: 'Result is already out for this player.' };
  }

  const { error } = await supabase.from('predictions').upsert(
    {
      user_id: user.id,
      player_id: playerId,
      predicted_price: predictedPrice,
      predicted_team_id: predictedTeamId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,player_id' }
  );

  if (error) return { success: false, error: error.message };

  revalidatePath('/predictions');
  return { success: true };
}

/** Admin-only: set auction result for a player */
export async function setPlayerResult(
  playerId: string,
  soldPrice: number,
  soldTeamId: string
): Promise<ActionResult> {
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
  revalidatePath('/admin/players');
  return { success: true };
}
