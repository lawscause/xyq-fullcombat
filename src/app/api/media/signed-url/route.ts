import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateSignedStreamUrl } from "@/lib/media/signed-urls";
import type { Membership } from "@/types/domain";

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json(
      { error: "videoId is required" },
      { status: 400 }
    );
  }

  // Verify user has active membership for premium content
  const { data: membership } = await supabase
    .from("memberships")
    .select("status")
    .eq("user_id", user.id)
    .single() as { data: Pick<Membership, "status"> | null };

  if (!membership || !["active", "grace"].includes(membership.status)) {
    return NextResponse.json(
      { error: "Active membership required" },
      { status: 403 }
    );
  }

  try {
    const signedUrl = await generateSignedStreamUrl(videoId);
    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Failed to generate signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate URL" },
      { status: 500 }
    );
  }
}
