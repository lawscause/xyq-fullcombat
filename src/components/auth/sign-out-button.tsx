"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-xs text-muted-foreground">Sign out?</span>
        <button
          onClick={handleSignOut}
          className="rounded px-2 py-0.5 text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
        >
          Yes
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-destructive w-full"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
