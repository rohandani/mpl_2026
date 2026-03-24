import Image from 'next/image';
import type { Sponsor } from '@/types/sponsor';

interface SponsorBannerProps {
  sponsors: Sponsor[];
}

export function SponsorBanner({ sponsors }: SponsorBannerProps) {
  const active = sponsors.filter((s) => s.is_active);
  if (active.length === 0) return null;

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-border">
      <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Supported by our community
      </p>
      <div className="flex flex-wrap items-center justify-center gap-6">
        {active.map((sponsor) => {
          const content = (
            <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50">
              {sponsor.logo_url && (
                <Image
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  width={36}
                  height={36}
                  className="rounded-md object-contain"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{sponsor.name}</p>
                {sponsor.tagline && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {sponsor.tagline}
                  </p>
                )}
              </div>
            </div>
          );

          return sponsor.link_url ? (
            <a
              key={sponsor.id}
              href={sponsor.link_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {content}
            </a>
          ) : (
            <div key={sponsor.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
