'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type ActionResult = { success: true } | { success: false; error: string };

interface BulkPrediction {
  playerId: string;
  predictedPrice: number;
  predictedTeamId: string;
}

type BulkResult = {
  success: boolean;
  results: { playerId: string; success: boolean; error?: string }[];
};

export async function submitBulkPredictions(
  items: BulkPrediction[]
): Promise<BulkResult> {
  if (!items.length) return { success: false, results: [] };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, results: [] };

  const { data: settings } = await supabase
    .from('app_settings')
    .select('predictions_locked')
    .eq('id', 'default')
    .maybeSingle();

  if (settings?.predictions_locked) {
    return {
      success: false,
      results: items.map((i) => ({
        playerId: i.playerId,
        success: false,
        error: 'Predictions are currently locked.',
      })),
    };
  }

  const { data: soldAuctions } = await supabase
    .from('auctions')
    .select('player_id')
    .not('sold_price', 'is', null);

  const soldSet = new Set((soldAuctions ?? []).map((a) => a.player_id));

  const results: BulkResult['results'] = [];
  const toUpsert: {
    user_id: string;
    player_id: string;
    predicted_price: number;
    predicted_team_id: string;
    updated_at: string;
  }[] = [];

  for (const item of items) {
    if (!item.playerId || !item.predictedTeamId) {
      results.push({ playerId: item.playerId, success: false, error: 'Missing fields.' });
      continue;
    }
    if (item.predictedPrice < 0 || isNaN(item.predictedPrice)) {
      results.push({ playerId: item.playerId, success: false, error: 'Invalid price.' });
      continue;
    }
    if (soldSet.has(item.playerId)) {
      results.push({ playerId: item.playerId, success: false, error: 'Result already out.' });
      continue;
    }
    toUpsert.push({
      user_id: user.id,
      player_id: item.playerId,
      predicted_price: item.predictedPrice,
      predicted_team_id: item.predictedTeamId,
      updated_at: new Date().toISOString(),
    });
    results.push({ playerId: item.playerId, success: true });
  }

  if (toUpsert.length > 0) {
    const { error } = await supabase
      .from('predictions')
      .upsert(toUpsert, { onConflict: 'user_id,player_id' });

    if (error) {
      return {
        success: false,
        results: items.map((i) => ({
          playerId: i.playerId,
          success: false,
          error: error.message,
        })),
      };
    }
  }

  revalidatePath('/predictions');
  return { success: true, results };
}

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

  // Check if predictions are globally locked
  const { data: settings } = await supabase
    .from('app_settings')
    .select('predictions_locked')
    .eq('id', 'default')
    .maybeSingle();

  if (settings?.predictions_locked) {
    return { success: false, error: 'Predictions are currently locked.' };
  }

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
