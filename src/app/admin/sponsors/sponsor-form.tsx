'use client';

import { useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { addSponsor } from './actions';

export function SponsorForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await addSponsor(formData);
      if (!res.success) setError(res.error);
      else formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-medium">Business Name *</label>
          <input
            id="name" name="name" required
            className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="tagline" className="text-xs font-medium">Tagline</label>
          <input
            id="tagline" name="tagline" placeholder="e.g. Best chai in town"
            className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="logo_url" className="text-xs font-medium">Logo URL</label>
          <input
            id="logo_url" name="logo_url" type="url" placeholder="https://..."
            className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="link_url" className="text-xs font-medium">Website URL</label>
          <input
            id="link_url" name="link_url" type="url" placeholder="https://..."
            className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>
      </div>
      <input type="hidden" name="display_order" value="0" />
      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? 'Adding…' : 'Add Sponsor'}
      </Button>
    </form>
  );
}
