'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type ActionResult = { success: true } | { success: false; error: string };

export async function addSponsor(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') {
    return { success: false, error: 'Admin access required.' };
  }

  const name = (formData.get('name') as string)?.trim();
  if (!name) return { success: false, error: 'Name is required.' };

  const { error } = await supabase.from('sponsors').insert({
    name,
    tagline: (formData.get('tagline') as string)?.trim() || null,
    logo_url: (formData.get('logo_url') as string)?.trim() || null,
    link_url: (formData.get('link_url') as string)?.trim() || null,
    display_order: Number(formData.get('display_order')) || 0,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/sponsors');
  return { success: true };
}

export async function toggleSponsor(id: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('sponsors')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/sponsors');
  return { success: true };
}

export async function deleteSponsor(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('sponsors').delete().eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/sponsors');
  return { success: true };
}
