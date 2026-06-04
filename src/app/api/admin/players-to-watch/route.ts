import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fixtureId, playerId, highlightType, description, sortOrder } = body;

    if (!fixtureId || !playerId || !highlightType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('players_to_watch')
      .insert({
        fixture_id: fixtureId,
        player_id: playerId,
        highlight_type: highlightType,
        description,
        sort_order: sortOrder || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating player to watch:', error);
      return NextResponse.json({ error: 'Failed to create player to watch' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in players-to-watch POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}