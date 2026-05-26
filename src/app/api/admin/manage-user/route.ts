import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const { data: callerRoles } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const callerRole = (callerRoles?.[0] as { role: string } | undefined)?.role;
  if (callerRole !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, action } = body;

  if (!userId || !action) {
    return NextResponse.json({ error: "userId and action are required" }, { status: 400 });
  }

  // Can't act on yourself
  if (userId === user.id) {
    return NextResponse.json({ error: "You cannot modify your own account" }, { status: 400 });
  }

  switch (action) {
    case "disable": {
      // Ban the user (sets banned_until to far future)
      const { error } = await adminClient.auth.admin.updateUserById(userId, {
        ban_duration: "876000h", // ~100 years
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: "disabled" });
    }

    case "enable": {
      // Unban the user
      const { error } = await adminClient.auth.admin.updateUserById(userId, {
        ban_duration: "none",
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: "enabled" });
    }

    case "delete": {
      // Only allow deletion if user has never confirmed/logged in
      const { data: targetAuth } = await adminClient.auth.admin.getUserById(userId);

      if (!targetAuth?.user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const hasConfirmed = !!targetAuth.user.confirmed_at;
      const hasLoggedIn = !!targetAuth.user.last_sign_in_at;

      if (hasConfirmed || hasLoggedIn) {
        return NextResponse.json(
          { error: "Cannot delete a user who has confirmed their email or logged in. Disable them instead." },
          { status: 400 }
        );
      }

      // Delete from auth (cascades to profiles, user_roles, etc.)
      const { error } = await adminClient.auth.admin.deleteUser(userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: "deleted" });
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
