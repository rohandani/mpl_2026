import { createClient } from '@/lib/supabase/server';
import { ShareConfigForm } from './share-config-form';
import type { ShareConfig } from '@/types/share-config';
import { PERMANENT_HASHTAGS } from '@/types/share-config';

export default async function ShareConfigPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('share_config')
    .select('*')
    .eq('id', 'default')
    .single();

  const config: ShareConfig = data ?? {
    id: 'default',
    title: 'Predictions',
    hashtags: ['#CricketAuction'],
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Share Card Config</h1>
        <p className="text-sm text-muted-foreground">
          Customize what appears on the share card users can download.
        </p>
      </div>

      <ShareConfigForm config={config} />

      <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
        <p className="font-medium">Permanent hashtags (always included):</p>
        <div className="flex flex-wrap gap-2">
          {PERMANENT_HASHTAGS.map((h) => (
            <span
              key={h}
              className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
