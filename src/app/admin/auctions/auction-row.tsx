'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { setPlayerResult } from './actions';
import type { Player } from '@/types/player';
import type { Auction } from '@/types/prediction';
import type { Team } from '@/types/team';

interface AuctionPlayer extends Player {
  auction: Auction | null;
}

interface Props {
  player: AuctionPlayer;
  teams: Team[];
}

export function AuctionRow({ player, teams }: Props) {
  const isSold = player.auction?.sold_price != null;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [price, setPrice] = useState(
    player.auction?.sold_price?.toString() ?? ''
  );
  const [teamId, setTeamId] = useState(
    player.auction?.sold_to_team_id ?? ''
  );

  const soldTeam = teams.find((t) => t.id === player.auction?.sold_to_team_id);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await setPlayerResult(player.id, Number(price), teamId);
      if (!res.success) setError(res.error);
    });
  }

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30">
      <td className="py-2.5 pl-4 font-medium">{player.name}</td>
      <td className="py-2.5 text-muted-foreground">{player.role}</td>
      <td className="py-2.5">${player.base_price}</td>
      <td className="py-2.5">
        {isSold ? (
          <span className="font-semibold text-primary">${player.auction!.sold_price}</span>
        ) : (
          <input
            type="number"
            min={0}
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-7 w-24 rounded-md border border-border bg-white px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        )}
      </td>
      <td className="py-2.5">
        {isSold ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: `${soldTeam?.color ?? '#94a3b8'}20`, color: soldTeam?.color ?? '#64748b' }}
          >
            {soldTeam?.name ?? 'Unknown'}
          </span>
        ) : (
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="h-7 w-40 rounded-md border border-border bg-white px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          >
            <option value="">Select team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </td>
      <td className="py-2.5 pr-4 text-right">
        {error && <span className="mr-2 text-xs text-destructive">{error}</span>}
        {!isSold ? (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending || !price || !teamId}
          >
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={isPending || !price || !teamId}
          >
            {isPending ? 'Updating…' : 'Edit'}
          </Button>
        )}
      </td>
    </tr>
  );
}
