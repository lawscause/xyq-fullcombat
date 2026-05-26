import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils/dates";
import Link from "next/link";
import { InviteUserForm } from "@/components/admin/invite-user-form";

export const metadata: Metadata = {
  title: "Users — XYQ Admin",
};

interface UserRow {
  id: string;
  full_name: string | null;
  created_at: string;
}

interface RoleRow {
  user_id: string;
  role: string;
}

type InviteStatus = "active" | "accepted" | "pending";

function getInviteStatus(authUser: {
  invited_at?: string | null;
  confirmed_at?: string | null;
  last_sign_in_at?: string | null;
}): InviteStatus {
  if (authUser.last_sign_in_at) return "active";
  if (authUser.confirmed_at) return "accepted";
  if (authUser.invited_at) return "pending";
  return "active"; // Self-registered users
}

const STATUS_STYLES: Record<InviteStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-100 text-green-800" },
  accepted: { label: "Accepted", className: "bg-blue-100 text-blue-800" },
  pending: { label: "Invite Sent", className: "bg-yellow-100 text-yellow-800" },
};

export default async function AdminUsersPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();

  // Get caller's role for the invite form
  const { data: callerRoles } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user!.id);
  const callerRole = (callerRoles?.[0] as { role: string } | undefined)?.role || "trial";

  // Get all auth users for invite status
  const { data: authData } = await adminClient.auth.admin.listUsers();
  const authUsers = authData?.users || [];

  // Build auth lookup
  const authMap = new Map<string, typeof authUsers[number]>();
  authUsers.forEach((u) => authMap.set(u.id, u));

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, full_name, created_at")
    .order("created_at", { ascending: false });

  const { data: allRoles } = await adminClient
    .from("user_roles")
    .select("user_id, role");

  const roleMap = new Map<string, string>();
  (allRoles as RoleRow[] | null)?.forEach((r) => {
    roleMap.set(r.user_id, r.role);
  });

  const users = (profiles as UserRow[] | null) || [];

  return (
    <div className="space-y-8">
      {/* Invite Section */}
      <section className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-medium">Invite New User</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Send an email invitation to join the platform with a specific role.
        </p>
        <div className="mt-4">
          <InviteUserForm callerRole={callerRole} />
        </div>
      </section>

      {/* Users List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">All Users</h2>
          <span className="text-sm text-muted-foreground">
            {users.length} total
          </span>
        </div>

        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Joined</th>
                <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Last Login</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((profile) => {
                  const userRole = roleMap.get(profile.id) || "trial";
                  const authUser = authMap.get(profile.id);
                  const status = authUser
                    ? getInviteStatus({
                        invited_at: authUser.invited_at,
                        confirmed_at: authUser.confirmed_at,
                        last_sign_in_at: authUser.last_sign_in_at,
                      })
                    : "active";
                  const statusStyle = STATUS_STYLES[status];

                  return (
                    <tr key={profile.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/users/${profile.id}`}
                          className="font-medium hover:underline"
                        >
                          {profile.full_name || authUser?.email || "Unnamed"}
                        </Link>
                        {authUser?.email && profile.full_name && (
                          <p className="text-xs text-muted-foreground">
                            {authUser.email}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                            userRole === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : userRole === "instructor"
                                ? "bg-blue-100 text-blue-800"
                                : userRole === "member"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {userRole}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${statusStyle.className}`}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {formatDate(profile.created_at)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                        {authUser?.last_sign_in_at
                          ? formatDate(authUser.last_sign_in_at)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/users/${profile.id}`}
                          className="text-muted-foreground hover:text-foreground text-xs"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No users yet. Send an invitation above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
