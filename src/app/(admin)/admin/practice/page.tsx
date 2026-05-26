import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils/dates";
import type { PracticePost } from "@/types/domain";

export const metadata: Metadata = {
  title: "Practice Posts — XYQ Admin",
};

export default async function AdminPracticePage() {
  const supabase = await createServerClient();

  const { data: posts } = await supabase
    .from("practice_posts")
    .select("*")
    .order("created_at", { ascending: false }) as { data: PracticePost[] | null };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Practice Posts</h1>
        <Link
          href="/admin/practice/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      <div className="space-y-3">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/admin/practice/${post.id}`}
              className="block rounded-lg border bg-card p-4 hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {post.post_type}
                  </span>
                  <h3 className="font-medium">{post.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      post.published
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(post.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No practice posts yet. Create one to share with students.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
