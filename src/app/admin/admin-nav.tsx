"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Teams", href: "/admin/teams" },
  { label: "Players", href: "/admin/players" },
  { label: "Auctions", href: "/admin/auctions" },
  { label: "Share Config", href: "/admin/share-config" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-primary/20 bg-white px-4">
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
