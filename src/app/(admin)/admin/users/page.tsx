import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/dates";

export const metadata: Metadata = {
  title: "Users — XYQ Admin",
};

interface UserWithRole {
  id: string;
  full_name: string | null;
  created_at: string;
}

export default async function AdminUsersPage() {
  const supabase = await createServerClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .order("created_at", { ascending: false }) as { data: UserWithRole[] | null };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Joined</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles && profiles.length > 0 ? (
              profiles.map((profile) => (
                <tr key={profile.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-medium">
                      {profile.full_name || "Unnamed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    {formatDate(profile.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/admin/users/${profile.id}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Manage
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
