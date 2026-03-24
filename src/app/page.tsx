import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";
import { AppHeader } from "@/components/app-header";
import { SponsorBanner } from "@/components/sponsor-banner";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { ShareConfig } from "@/types/share-config";
import type { Sponsor } from "@/types/sponsor";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: shareConfig }, { data: sponsors }] = await Promise.all([
    supabase.from('share_config').select('*').eq('id', 'default').single(),
    supabase.from('sponsors').select('*').eq('is_active', true).order('display_order'),
  ]);

  const displayName =
    user?.user_metadata?.full_name ?? user?.email ?? "Player";
  const config = shareConfig as ShareConfig | null;
  const activeSponors = (sponsors as Sponsor[]) ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        showAdmin={isAdmin(user)}
        shareCardData={{
          userName: displayName,
          title: config?.title,
          customHashtags: config?.hashtags,
          sponsorNames: activeSponors.map((s) => s.name),
        }}
      />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <Image
              src="/mpl-logo.png"
              alt="MPL 2026 logo"
              width={56}
              height={56}
              className="mx-auto"
            />
            <h1 className="text-2xl font-bold">Welcome, {displayName}</h1>
            <p className="text-sm text-muted-foreground">
              Predict auction prices, pick teams, and climb the leaderboard.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/predictions" className="group">
              <Card className="h-full border-t-4 border-t-emerald-500 transition-shadow group-hover:shadow-md">
                <CardContent className="space-y-2 pt-4 text-center">
                  <span className="text-3xl">🎯</span>
                  <CardTitle className="text-base">Predictions</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Predict selling prices and buying teams for each player.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/leaderboard" className="group">
              <Card className="h-full border-t-4 border-t-amber-500 transition-shadow group-hover:shadow-md">
                <CardContent className="space-y-2 pt-4 text-center">
                  <span className="text-3xl">🏆</span>
                  <CardTitle className="text-base">Leaderboard</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    See who's leading the prediction game.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/teams" className="group">
              <Card className="h-full border-t-4 border-t-blue-500 transition-shadow group-hover:shadow-md">
                <CardContent className="space-y-2 pt-4 text-center">
                  <span className="text-3xl">🏏</span>
                  <CardTitle className="text-base">Teams</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    View all teams and their squads.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <SponsorBanner sponsors={activeSponors} />
        </div>
      </main>
    </div>
  );
}
