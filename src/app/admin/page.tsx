import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name ?? user?.email ?? "Admin";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-primary/30 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/mpl-logo.png" alt="MPL 2026 logo" width={32} height={32} />
            <span className="text-lg font-semibold">
              MPL <span className="text-primary">2026</span> — Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-t-4 border-t-primary">
          <CardHeader className="items-center text-center">
            <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>Welcome, {displayName}. Management features coming soon.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
