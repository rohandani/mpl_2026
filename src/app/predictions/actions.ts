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
