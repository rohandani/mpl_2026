"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="min-h-[44px] cursor-pointer"
      onClick={handleSignOut}
    >
      Sign Out
    </Button>
  );
}
