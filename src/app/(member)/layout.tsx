import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MemberShell } from "@/components/layout/member-shell";

export default async function MemberLayout({
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

  // Use admin client to bypass RLS for role check
  const adminClient = createAdminClient();
  const { data: roles } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const userRole = (roles?.[0] as { role: string } | undefined)?.role || "trial";

  return (
    <MemberShell user={user} role={userRole}>
      {children}
    </MemberShell>
  );
}
