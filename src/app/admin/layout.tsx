import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";
import { SignOutButton } from "@/components/sign-out-button";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdmin(user)) {
    redirect("/");
  }

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
      <AdminNav />
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
