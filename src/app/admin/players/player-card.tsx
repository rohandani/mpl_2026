'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, User, ExternalLink } from 'lucide-react';
import type { Player } from '@/types/player';

interface PlayerCardProps {
  player: Player;
  onEdit?: (player: Player) => void;
  onDelete?: (playerId: string) => void;
}

export function PlayerCard({ player, onEdit, onDelete }: PlayerCardProps) {
  return (
    <Card className="pt-0">
      <div className="h-1.5 rounded-t-xl bg-gradient-to-r from-emerald-500 to-teal-500" />
      <CardContent className="space-y-3 pt-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="size-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{player.name}</span>
                {player.is_captain && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Captain
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{player.role}</p>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Edit ${player.name}`}
              onClick={() => onEdit?.(player)}
            >
              <Pencil className="size-3.5" />
            </Button>
            {!player.is_captain && (
              <Button
                variant="destructive"
                size="icon-xs"
                aria-label={`Delete ${player.name}`}
                onClick={() => onDelete?.(player.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">${player.base_price} CAD</span>
          {player.cricheroes_url && (
            <a
              href={player.cricheroes_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              CricHeroes <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
