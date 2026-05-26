import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_ROLES = ["admin", "instructor", "member", "trial"];

export async function POST(request: Request) {
  // Verify the caller is admin or instructor
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
  const { email, fullName, role } = body;

  if (!email || !role) {
    return NextResponse.json({ error: "email and role are required" }, { status: 400 });
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Instructors can only invite member or trial
  if (callerRole === "instructor" && (role === "admin" || role === "instructor")) {
    return NextResponse.json(
      { error: "Instructors can only invite members and trial users" },
      { status: 403 }
    );
  }

  // Check if user already exists
  const { data: existingUsers } = await adminClient.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  // Create the user with an invite (sends magic link email)
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/callback`;

  const { data: newUser, error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName || null,
        invited_role: role,
      },
      redirectTo,
    });

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  if (!newUser?.user) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }

  // Assign the role (the trigger creates a 'trial' role, so we need to update it)
  // Wait a moment for the trigger to fire, then update
  await adminClient
    .from("user_roles")
    .delete()
    .eq("user_id", newUser.user.id);

  await adminClient
    .from("user_roles")
    .insert({ user_id: newUser.user.id, role });

  return NextResponse.json({
    success: true,
    user: {
      id: newUser.user.id,
      email: newUser.user.email,
      role,
    },
  });
}
