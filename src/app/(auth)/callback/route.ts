import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if this is an invited user who hasn't set up their password yet
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const isInvited = !!user.invited_at;
        const setupComplete = user.user_metadata?.setup_complete === true;

        // Invited users who haven't completed setup go to password page
        if (isInvited && !setupComplete) {
          return NextResponse.redirect(`${origin}/setup`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth code exchange failed — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
