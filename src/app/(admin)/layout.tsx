import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminShell } from "@/components/layout/admin-shell";

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

  const adminClient = createAdminClient();
  const { data: roles } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const userRoles = roles?.map((r: { role: string }) => r.role) || [];
  const hasAccess =
    userRoles.includes("admin") || userRoles.includes("instructor");

  if (!hasAccess) {
    redirect("/dashboard");
  }

  return <AdminShell>{children}</AdminShell>;
}
