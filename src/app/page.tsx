import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";
import { SignOutButton } from "@/components/sign-out-button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name ?? user?.email ?? "Player";

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="border-b border-primary/30 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/mpl-logo.png" alt="MPL 2026 logo" width={32} height={32} />
            <span className="text-lg font-semibold">
              MPL <span className="text-primary">2026</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin(user) && (
              <Link
                href="/admin"
                className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted hover:text-foreground"
              >
                Admin Panel
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-6">
          {/* Welcome */}
          <div className="text-center space-y-2">
            <Image
              src="/mpl-logo.png"
              alt="MPL 2026 logo"
              width={56}
              height={56}
              className="mx-auto"
            />
            <h1 className="text-2xl font-bold">
              Welcome, {displayName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Predict auction prices, pick teams, and climb the leaderboard.
            </p>
          </div>

          {/* Cards */}
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
        </div>
      </main>
    </div>
  );
}
