'use client';

import { AuctionRow } from './auction-row';
import type { Player } from '@/types/player';
import type { Auction } from '@/types/prediction';
import type { Team } from '@/types/team';

interface AuctionPlayer extends Player {
  auction: Auction | null;
}

interface Props {
  pending: AuctionPlayer[];
  sold: AuctionPlayer[];
  teams: Team[];
}

export function AuctionList({ pending, sold, teams }: Props) {
  return (
    <div className="space-y-8">
      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            ⏳ Pending ({pending.length})
          </h2>
          <div className="overflow-hidden rounded-xl ring-1 ring-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="py-2.5 pl-4 text-left font-medium text-muted-foreground">Player</th>
                  <th className="py-2.5 text-left font-medium text-muted-foreground">Role</th>
                  <th className="py-2.5 text-left font-medium text-muted-foreground">Base Price</th>
                  <th className="py-2.5 text-left font-medium text-muted-foreground">Sold Price</th>
                  <th className="py-2.5 text-left font-medium text-muted-foreground">Sold To</th>
                  <th className="py-2.5 pr-4 text-right font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <AuctionRow key={p.id} player={p} teams={teams} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sold */}
      {sold.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            ✅ Sold ({sold.length})
          </h2>
          <div className="overflow-hidden rounded-xl ring-1 ring-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="py-2.5 pl-4 text-left font-medium text-muted-foreground">Player</th>
                  <th className="py-2.5 text-left font-medium text-muted-foreground">Role</th>
                  <th className="py-2.5 text-left font-medium text-muted-foreground">Base Price</th>
                  <th className="py-2.5 text-left font-medium text-muted-foreground">Sold Price</th>
                  <th className="py-2.5 text-left font-medium text-muted-foreground">Sold To</th>
                  <th className="py-2.5 pr-4 text-right font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {sold.map((p) => (
                  <AuctionRow key={p.id} player={p} teams={teams} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pending.length === 0 && sold.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No auctionable players found.
        </p>
      )}
    </div>
  );
}
