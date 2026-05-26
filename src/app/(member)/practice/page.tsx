import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { PracticePost } from "@/components/practice/practice-post";
import type { PracticePost as PracticePostType } from "@/types/domain";

export const metadata: Metadata = {
  title: "Practice — XYQ Full Combat",
};

export default async function PracticePage() {
  const supabase = await createServerClient();

  const { data: posts } = await supabase
    .from("practice_posts")
    .select(
      `
      *,
      author:profiles (full_name, avatar_url)
    `
    )
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(20) as { data: PracticePostType[] | null };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Weekly Practice
        </h1>
        <p className="mt-1 text-muted-foreground">
          Class recaps, drills, and practice reminders from your instructors.
        </p>
      </div>

      <div className="space-y-6">
        {posts && posts.length > 0 ? (
          posts.map((post) => <PracticePost key={post.id} post={post} />)
        ) : (
          <div className="rounded-lg border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Practice posts will appear here as instructors add weekly content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
