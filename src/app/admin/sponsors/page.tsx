import { createClient } from '@/lib/supabase/server';
import { SponsorForm } from './sponsor-form';
import { SponsorList } from './sponsor-list';
import type { Sponsor } from '@/types/sponsor';

export default async function SponsorsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('sponsors')
    .select('*')
    .order('display_order');

  const sponsors: Sponsor[] = (data as Sponsor[]) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Sponsors</h1>
        <p className="text-sm text-muted-foreground">
          Manage community business ads. Active sponsors appear in the app and on share cards.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Add Sponsor</h2>
        <SponsorForm />
      </div>

      <SponsorList sponsors={sponsors} />
    </div>
  );
}
