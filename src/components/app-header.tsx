import Image from 'next/image';
import Link from 'next/link';
import { SignOutButton } from '@/components/sign-out-button';
import { ShareButton } from '@/components/share-button';
import type { ShareCardData } from '@/lib/share-card';

interface AppHeaderProps {
  showAdmin?: boolean;
  shareCardData?: ShareCardData;
}

const NAV_LINKS = [
  { href: '/predictions', label: '🎯 Auction' },
  { href: '/fixtures', label: '📅 Fixtures' },
  { href: '/leaderboard', label: '🏆 Leaderboard' },
  { href: '/teams', label: '🏏 Teams' },
];

export function AppHeader({ showAdmin = false, shareCardData }: AppHeaderProps) {
  return (
    <header className="border-b border-primary/30 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/mpl-logo.png" alt="MPL 2026 logo" width={32} height={32} />
            <span className="text-lg font-semibold">
              MPL <span className="text-primary">2026</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:text-sm"
            >
              {link.label}
            </Link>
          ))}
          <ShareButton cardData={shareCardData} />
          {showAdmin && (
            <Link
              href="/admin"
              className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted hover:text-foreground"
            >
              Admin
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
