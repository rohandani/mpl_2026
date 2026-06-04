import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  try {
    const { fixtureId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('players_to_watch')
      .select(`
        *,
        player:players(id, name, role, team_id)
      `)
      .eq('fixture_id', fixtureId)
      .order('sort_order');

    if (error) {
      console.error('Error fetching players to watch:', error);
      return NextResponse.json({ error: 'Failed to fetch players to watch' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in players-to-watch GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}