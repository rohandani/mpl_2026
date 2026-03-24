'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { PlayerRole } from '@/types/player';

const VALID_ROLES: PlayerRole[] = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];

type ActionResult = { success: true } | { success: false; error: string };

function validatePlayerInput(data: {
  name?: string;
  role?: string;
  base_price?: number;
}): string | null {
  if (!data.name || data.name.trim().length === 0) {
    return 'Name is required.';
  }
  if (!data.role || !VALID_ROLES.includes(data.role as PlayerRole)) {
    return 'Role must be one of: Batsman, Bowler, All-Rounder, Wicket-Keeper.';
  }
  if (data.base_price == null || isNaN(data.base_price) || data.base_price < 0) {
    return 'Base price must be a valid non-negative number.';
  }
  return null;
}

export async function addPlayer(formData: FormData): Promise<ActionResult> {
  const name = formData.get('name') as string | null;
  const role = formData.get('role') as string | null;
  const basePriceRaw = formData.get('base_price');
  const base_price = basePriceRaw ? Number(basePriceRaw) : NaN;
  const cricheroes_url = (formData.get('cricheroes_url') as string) || null;
  const is_captain = formData.get('is_captain') === 'on';

  const validationError = validatePlayerInput({ name: name ?? undefined, role: role ?? undefined, base_price });
  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('players').insert({
    name: name!.trim(),
    role,
    base_price,
    cricheroes_url: cricheroes_url?.trim() || null,
    is_captain,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/players');
  return { success: true };
}

export async function updatePlayer(id: string, formData: FormData): Promise<ActionResult> {
  if (!id) {
    return { success: false, error: 'Player ID is required.' };
  }

  const name = formData.get('name') as string | null;
  const role = formData.get('role') as string | null;
  const basePriceRaw = formData.get('base_price');
  const base_price = basePriceRaw ? Number(basePriceRaw) : NaN;
  const cricheroes_url = (formData.get('cricheroes_url') as string) || null;
  const is_captain = formData.get('is_captain') === 'on';

  const validationError = validatePlayerInput({ name: name ?? undefined, role: role ?? undefined, base_price });
  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('players')
    .update({
      name: name!.trim(),
      role,
      base_price,
      cricheroes_url: cricheroes_url?.trim() || null,
      is_captain,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/players');
  return { success: true };
}

export async function deletePlayer(id: string): Promise<ActionResult> {
  if (!id) {
    return { success: false, error: 'Player ID is required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('players').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/players');
  return { success: true };
}
