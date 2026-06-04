import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('players_to_watch')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting player to watch:', error);
      return NextResponse.json({ error: 'Failed to delete player to watch' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in players-to-watch DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}