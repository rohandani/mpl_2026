import Image from "next/image";
import { ExternalLink, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Team } from "@/types/team";
import type { Player } from "@/types/player";

interface TeamRosterProps {
  team: Team;
  players: Player[];
  soldPriceMap?: Record<string, number>;
}

export function TeamRoster({ team, players, soldPriceMap = {} }: TeamRosterProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={{ backgroundColor: `${team.color}20` }}
        >
          <Image
            src={team.logo}
            alt={`${team.name} logo`}
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{team.name}</h2>
          <p className="text-xs text-muted-foreground">
            {players.length} {players.length === 1 ? "player" : "players"}
          </p>
        </div>
      </div>

      {players.length === 0 ? (
        <p className="text-sm text-muted-foreground">No players assigned yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <Card key={player.id} className="pt-0" size="sm">
              <div
                className="h-1 rounded-t-xl"
                style={{ backgroundColor: team.color }}
              />
              <CardContent className="flex items-center gap-3 pt-2">
                <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {player.photo_url ? (
                    <Image
                      src={player.photo_url}
                      alt={player.name}
                      width={32}
                      height={32}
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">
                      {player.name}
                    </span>
                    {player.is_captain && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                        C
                      </span>
                    )}
                    {player.cricheroes_url && (
                      <a
                        href={player.cricheroes_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label={`${player.name} CricHeroes profile`}
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {player.role} · ${soldPriceMap[player.id] ?? player.base_price}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
