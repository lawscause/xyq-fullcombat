"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PracticePost } from "@/types/domain";

interface PracticePostFormProps {
  post?: PracticePost;
}

export function PracticePostForm({ post }: PracticePostFormProps) {
  const router = useRouter();
  const isEditing = !!post;

  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [postType, setPostType] = useState<PracticePost["post_type"]>(
    post?.post_type || "recap"
  );
  const [published, setPublished] = useState(post?.published || false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setSaving(false);
      return;
    }

    const postData = {
      title,
      content,
      post_type: postType,
      published,
      author_id: user.id,
    };

    try {
      if (isEditing) {
        const { error: updateError } = await (supabase
          .from("practice_posts") as any)
          .update(postData)
          .eq("id", post!.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await (supabase
          .from("practice_posts") as any)
          .insert(postData);

        if (insertError) throw insertError;
      }

      router.push("/admin/practice");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">Post Type</Label>
            <select
              id="type"
              value={postType}
              onChange={(e) => setPostType(e.target.value as PracticePost["post_type"])}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="recap">Class Recap</option>
              <option value="drill">Practice Drill</option>
              <option value="announcement">Announcement</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={published ? "published" : "draft"}
              onChange={(e) => setPublished(e.target.value === "published")}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Week of May 26 — Five Element Linking"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What was covered in class, drills to practice at home, key corrections..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[250px] resize-y placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
          <p className="text-xs text-muted-foreground">
            Plain text. Use line breaks to separate sections.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Update Post" : "Publish Post"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/practice")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
