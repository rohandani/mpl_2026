'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type ActionResult = { success: true } | { success: false; error: string };

export async function updateShareConfig(
  title: string,
  hashtags: string[]
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return { success: false, error: 'Admin access required.' };
  }

  if (!title.trim()) {
    return { success: false, error: 'Title is required.' };
  }

  // Clean hashtags: ensure they start with #, remove empties
  const cleaned = hashtags
    .map((h) => h.trim())
    .filter(Boolean)
    .map((h) => (h.startsWith('#') ? h : `#${h}`));

  const { error } = await supabase
    .from('share_config')
    .update({
      title: title.trim(),
      hashtags: cleaned,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'default');

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/share-config');
  revalidatePath('/predictions');
  revalidatePath('/');
  return { success: true };
}
