import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import type { Profile, Membership } from "@/types/domain";

export const metadata: Metadata = {
  title: "Account — XYQ Full Combat",
};

export default async function AccountPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single() as { data: Profile | null };

  const { data: membership } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", user!.id)
    .single() as { data: Membership | null };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile and membership.
        </p>
      </div>

      {/* Profile */}
      <section className="rounded-lg border bg-card p-6">
        <h2 className="font-medium">Profile</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Email:</span>{" "}
            <span>{user?.email}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Name:</span>{" "}
            <span>{profile?.full_name || "Not set"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Member since:</span>{" "}
            <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</span>
          </div>
        </div>
      </section>

      {/* Membership */}
      <section className="rounded-lg border bg-card p-6">
        <h2 className="font-medium">Membership</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Status:</span>{" "}
            <span className="capitalize">
              {membership?.status || "No active membership"}
            </span>
          </div>
          {membership?.tier && (
            <div>
              <span className="text-muted-foreground">Plan:</span>{" "}
              <span className="capitalize">{membership.tier}</span>
            </div>
          )}
          {membership?.current_period_end && (
            <div>
              <span className="text-muted-foreground">Renews:</span>{" "}
              <span>
                {new Date(membership.current_period_end).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <a
            href="/api/stripe/portal"
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            Manage Billing
          </a>
        </div>
      </section>
    </div>
  );
}
