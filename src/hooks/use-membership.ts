"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Membership } from "@/types/domain";

interface MembershipState {
  status: Membership["status"] | null;
  tier: Membership["tier"] | null;
  loading: boolean;
}

export function useMembership() {
  const [state, setState] = useState<MembershipState>({
    status: null,
    tier: null,
    loading: true,
  });

  useEffect(() => {
    async function fetchMembership() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState({ status: null, tier: null, loading: false });
        return;
      }

      const { data } = await supabase
        .from("memberships")
        .select("status, tier")
        .eq("user_id", user.id)
        .single() as { data: Pick<Membership, "status" | "tier"> | null };

      setState({
        status: data?.status || null,
        tier: data?.tier || null,
        loading: false,
      });
    }

    fetchMembership();
  }, []);

  const isActive = state.status === "active" || state.status === "grace";

  return { ...state, isActive };
}
