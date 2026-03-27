'use client';

import Image from 'next/image';
import type { RacePlayer } from './page';

interface Props {
  players: RacePlayer[];
}

const RANK_BG = [
  'bg-amber-50 ring-amber-200',
  'bg-slate-50 ring-slate-200',
  'bg-orange-50 ring-orange-200',
  'bg-white ring-border',
  'bg-white ring-border',
];

const APP_URL = 'https://mpl-2026-hazel.vercel.app';

export function AuctionRace({ players }: Props) {
  if (players.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No predictions yet.
      </p>
    );
  }

  function handleWhatsAppShare() {
    const lines = players.map((p) => {
      const top = p.team_votes[0];
      return `${p.rank}. ${p.name} → ${top?.pct}% say ${top?.captain_name}'s squad`;
    });
    const text = `🏏 *MPL 2026 — Most Hyped Players* 🏏\n\n${lines.join('\n')}\n\n🔮 Based on user predictions!\n\n${APP_URL}\n\n#MPL2026 #CricketAuction`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      '_blank',
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight">
          🏏 Most <span className="text-primary">Hyped Players</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Where do people think they&apos;re headed?
        </p>
      </div>

      {/* Player Tiles — 2 column grid */}
      <div className="grid grid-cols-2 gap-3">
        {players.map((player, i) => (
          <div
            key={player.name}
            className={`rounded-2xl p-4 ring-1 ${RANK_BG[i]}`}
          >
            {/* Player header */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  i === 0
                    ? 'bg-amber-200 text-amber-800'
                    : i === 1
                      ? 'bg-slate-200 text-slate-700'
                      : i === 2
                        ? 'bg-orange-200 text-orange-800'
                        : 'bg-gray-200 text-gray-600'
                }`}
              >
                {player.rank}
              </span>
              <div>
                <span className="font-bold text-base">{player.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {player.role}
                </span>
              </div>
            </div>

            {/* Team destination rows */}
            <div className="space-y-2">
              {player.team_votes.map((tv) => (
                <div key={tv.team_name} className="flex items-center gap-3">
                  {/* Logo */}
                  <span
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full"
                    style={{ backgroundColor: `${tv.team_color}15` }}
                  >
                    {tv.team_logo ? (
                      <Image
                        src={tv.team_logo}
                        alt={tv.team_name}
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    ) : (
                      <span
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: tv.team_color }}
                      />
                    )}
                  </span>

                  {/* Bar + label */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium truncate">
                        {tv.team_name}
                        {tv.captain_name && (
                          <span className="text-muted-foreground font-normal">
                            {' '}· {tv.captain_name}
                          </span>
                        )}
                      </span>
                      <span
                        className="text-xs font-bold ml-2 shrink-0"
                        style={{ color: tv.team_color }}
                      >
                        {tv.pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${tv.pct}%`,
                          backgroundColor: tv.team_color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Share */}
      <div className="flex justify-center">
        <button
          onClick={handleWhatsAppShare}
          className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/50 transition-all hover:bg-[#20bd5a] hover:shadow-emerald-300/50 active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Share on WhatsApp
        </button>
      </div>
    </div>
  );
}
