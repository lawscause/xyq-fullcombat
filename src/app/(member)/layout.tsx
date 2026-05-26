import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
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

  return <MemberShell user={user}>{children}</MemberShell>;
}
