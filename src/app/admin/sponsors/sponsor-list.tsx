'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toggleSponsor, deleteSponsor } from './actions';
import type { Sponsor } from '@/types/sponsor';

export function SponsorList({ sponsors }: { sponsors: Sponsor[] }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => { await toggleSponsor(id, !current); });
  }

  function handleDelete(id: string) {
    if (!window.confirm('Delete this sponsor?')) return;
    startTransition(async () => { await deleteSponsor(id); });
  }

  if (sponsors.length === 0) {
    return <p className="text-sm text-muted-foreground">No sponsors yet.</p>;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        All Sponsors ({sponsors.length})
      </h2>
      <div className="overflow-hidden rounded-xl ring-1 ring-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="py-2 pl-4 text-left font-medium text-muted-foreground">Name</th>
              <th className="py-2 text-left font-medium text-muted-foreground">Tagline</th>
              <th className="py-2 text-center font-medium text-muted-foreground">Status</th>
              <th className="py-2 pr-4 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sponsors.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="py-2 pl-4 font-medium">{s.name}</td>
                <td className="py-2 text-muted-foreground">{s.tagline ?? '—'}</td>
                <td className="py-2 text-center">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-2 pr-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={isPending}
                      onClick={() => handleToggle(s.id, s.is_active)}
                    >
                      {s.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="xs"
                      disabled={isPending}
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
