import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_ROLES = ["admin", "instructor", "member", "trial"];

export async function POST(request: Request) {
  // Verify the caller is an admin
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Check caller's role
  const { data: callerRoles } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const callerRole = (callerRoles?.[0] as { role: string } | undefined)?.role;
  if (callerRole !== "admin" && callerRole !== "instructor") {
    return NextResponse.json({ error: "Admin or instructor access required" }, { status: 403 });
  }

  // Parse request
  const body = await request.json();
  const { userId, role } = body;

  if (!userId || !role) {
    return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Prevent admin from editing themselves
  if (userId === user.id) {
    return NextResponse.json(
      { error: "You cannot change your own role" },
      { status: 400 }
    );
  }

  // Instructors cannot manage other instructors or admins
  if (callerRole === "instructor") {
    // Check target user's current role
    const { data: targetRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const targetRole = (targetRoles?.[0] as { role: string } | undefined)?.role;
    if (targetRole === "admin" || targetRole === "instructor") {
      return NextResponse.json(
        { error: "Instructors cannot manage other instructors or admins" },
        { status: 403 }
      );
    }

    // Instructors cannot promote to admin or instructor
    if (role === "admin" || role === "instructor") {
      return NextResponse.json(
        { error: "Only admins can assign instructor or admin roles" },
        { status: 403 }
      );
    }
  }

  // Update the role — delete existing and insert new
  const { error: deleteError } = await adminClient
    .from("user_roles")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { error: insertError } = await adminClient
    .from("user_roles")
    .insert({ user_id: userId, role });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, role });
}
