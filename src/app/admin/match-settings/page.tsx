import { createClient } from '@/lib/supabase/server';
import { MatchSettingsForm } from './match-settings-form';
import type { MatchSettings } from '@/types/fixture';

export default async function MatchSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('match_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  const settings: MatchSettings = data ?? {
    id: 'default',
    prediction_deadline_minutes: 15,
    points_team_win: 10,
    points_mom: 15,
    points_highest_scorer: 15,
    points_highest_wicket_taker: 10,
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Match Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure prediction deadline and point values for match predictions.
        </p>
      </div>

      <MatchSettingsForm settings={settings} />
    </div>
  );
}
