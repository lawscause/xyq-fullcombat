import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check for admin or instructor role
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id) as { data: Pick<UserRole, "role">[] | null };

  const userRoles = roles?.map((r) => r.role) || [];
  const hasAccess =
    userRoles.includes("admin") || userRoles.includes("instructor");

  if (!hasAccess) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold tracking-tight">XYQ Admin</span>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="/admin" className="hover:text-foreground">
                Dashboard
              </a>
              <a href="/admin/lessons" className="hover:text-foreground">
                Lessons
              </a>
              <a href="/admin/events" className="hover:text-foreground">
                Events
              </a>
              <a href="/admin/users" className="hover:text-foreground">
                Users
              </a>
            </nav>
          </div>
          <a
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to site
          </a>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
