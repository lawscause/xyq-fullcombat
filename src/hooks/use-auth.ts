"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Role } from "@/lib/constants/roles";

interface AuthState {
  user: User | null;
  role: Role | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState({ user: null, role: null, loading: false });
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .order("role") as { data: { role: Role }[] | null };

      // Get highest role
      const roleHierarchy: Role[] = ["admin", "instructor", "member", "trial", "visitor"];
      const userRoles = roles?.map((r) => r.role) || [];
      const highestRole = roleHierarchy.find((r) =>
        userRoles.includes(r)
      );

      setState({
        user,
        role: highestRole || "visitor",
        loading: false,
      });
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUser();
      } else {
        setState({ user: null, role: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
