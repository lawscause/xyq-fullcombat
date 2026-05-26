import { formatRelative } from "@/lib/utils/dates";

interface PracticePostProps {
  post: {
    id: string;
    title: string;
    content: string;
    post_type: "recap" | "drill" | "announcement" | "reminder";
    created_at: string;
    author?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  };
}

const POST_TYPE_LABELS: Record<string, string> = {
  recap: "Class Recap",
  drill: "Practice Drill",
  announcement: "Announcement",
  reminder: "Reminder",
};

export function PracticePost({ post }: PracticePostProps) {
  return (
    <article className="rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {POST_TYPE_LABELS[post.post_type] || post.post_type}
          </span>
          <h3 className="mt-1 font-medium">{post.title}</h3>
        </div>
        <time className="shrink-0 text-xs text-muted-foreground">
          {formatRelative(post.created_at)}
        </time>
      </div>

      <div className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>

      {post.author?.full_name && (
        <p className="mt-4 text-xs text-muted-foreground">
          — {post.author.full_name}
        </p>
      )}
    </article>
  );
}
