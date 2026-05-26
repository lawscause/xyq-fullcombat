import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserRoleForm } from "@/components/admin/user-role-form";
import { UserActions } from "@/components/admin/user-actions";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Manage User — XYQ Admin",
};

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const adminClient = createAdminClient();

  // Get current user to check if viewing self
  const supabase = await createServerClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const isSelf = currentUser?.id === id;

  // Fetch user profile
  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("id", id)
    .single();

  if (!profile) {
    notFound();
  }

  // Fetch user's auth data
  const { data: authUser } = await adminClient.auth.admin.getUserById(id);

  // Fetch current roles
  const { data: roles } = await adminClient
    .from("user_roles")
    .select("id, role")
    .eq("user_id", id);

  const currentRole = (roles?.[0] as { id: string; role: string } | undefined)?.role || "trial";

  // Determine user status
  const isDisabled = !!authUser?.user?.banned_until &&
    new Date(authUser.user.banned_until) > new Date();
  const hasConfirmed = !!authUser?.user?.confirmed_at;
  const hasLoggedIn = !!authUser?.user?.last_sign_in_at;
  const canDelete = !hasConfirmed && !hasLoggedIn;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Manage User</h1>

      <section className="rounded-lg border bg-card p-6">
        <h2 className="font-medium">Profile</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span>{(profile as { full_name: string | null }).full_name || "Not set"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{authUser?.user?.email || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Joined</span>
            <span>
              {new Date((profile as { created_at: string }).created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last login</span>
            <span>
              {authUser?.user?.last_sign_in_at
                ? new Date(authUser.user.last_sign_in_at).toLocaleDateString()
                : "Never"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span>
              {isDisabled ? (
                <span className="rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs">
                  Disabled
                </span>
              ) : hasLoggedIn ? (
                <span className="rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs">
                  Active
                </span>
              ) : hasConfirmed ? (
                <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs">
                  Accepted
                </span>
              ) : (
                <span className="rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs">
                  Invite Pending
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Role</span>
            <span className="capitalize font-medium">{currentRole}</span>
          </div>
        </div>
      </section>

      {/* Role Management */}
      {isSelf ? (
        <section className="rounded-lg border border-border/50 bg-muted/30 p-6">
          <p className="text-sm text-muted-foreground">
            You cannot change your own role. Another admin must do this.
          </p>
        </section>
      ) : (
        <section className="rounded-lg border bg-card p-6">
          <h2 className="font-medium">Change Role</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update this user&apos;s access level.
          </p>
          <div className="mt-4">
            <UserRoleForm userId={id} currentRole={currentRole} />
          </div>
        </section>
      )}

      {/* Account Actions */}
      {!isSelf && (
        <section className="rounded-lg border bg-card p-6">
          <h2 className="font-medium">Account Actions</h2>
          <div className="mt-4">
            <UserActions
              userId={id}
              isDisabled={isDisabled}
              canDelete={canDelete}
            />
          </div>
        </section>
      )}
    </div>
  );
}
