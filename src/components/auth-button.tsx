"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Provider } from "@supabase/supabase-js";
import type { ReactNode } from "react";

interface AuthButtonProps {
  provider: Provider;
  icon: ReactNode;
  label: string;
}

export function AuthButton({ provider, icon, label }: AuthButtonProps) {
  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full min-h-[44px] gap-2 text-sm font-medium cursor-pointer"
      onClick={handleSignIn}
    >
      {icon}
      {label}
    </Button>
  );
}
