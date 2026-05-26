import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { LESSON_CATEGORIES } from "@/lib/constants/categories";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lessons — XYQ Full Combat",
};

interface LessonSummary {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  description: string | null;
  created_at: string;
}

export default async function LessonsPage() {
  const supabase = await createServerClient();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, slug, category_id, description, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false }) as { data: LessonSummary[] | null };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Lesson Library
        </h1>
        <p className="mt-1 text-muted-foreground">
          Organized by category. Select a topic to explore.
        </p>
      </div>

      {/* Category Navigation */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LESSON_CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/lessons/category/${category.slug}`}
            className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
          >
            <h3 className="font-medium text-sm">{category.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {category.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent Lessons */}
      <section>
        <h2 className="text-lg font-medium">Recently Added</h2>
        <div className="mt-4 space-y-3">
          {lessons && lessons.length > 0 ? (
            lessons.slice(0, 10).map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.slug}`}
                className="block rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
              >
                <h3 className="font-medium text-sm">{lesson.title}</h3>
                {lesson.description && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {lesson.description}
                  </p>
                )}
              </Link>
            ))
          ) : (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Lessons will appear here once content is published.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
