"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

interface BookmarkButtonProps {
  lessonId: string;
}

export function BookmarkButton({ lessonId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkBookmark() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single() as { data: { id: string } | null };

      setIsBookmarked(!!data);
      setLoading(false);
    }

    checkBookmark();
  }, [lessonId]);

  async function toggleBookmark() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (isBookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);
      setIsBookmarked(false);
    } else {
      await (supabase.from("bookmarks") as any).insert({
        user_id: user.id,
        lesson_id: lessonId,
      });
      setIsBookmarked(true);
    }
  }

  if (loading) return null;

  return (
    <button
      onClick={toggleBookmark}
      className={cn(
        "rounded-md p-2 transition-colors hover:bg-accent",
        isBookmarked ? "text-foreground" : "text-muted-foreground"
      )}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Bookmark
        className="h-5 w-5"
        fill={isBookmarked ? "currentColor" : "none"}
      />
    </button>
  );
}
