import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Manage Lessons — XYQ Admin",
};

interface LessonRow {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  access_level: string;
  category_id: string | null;
  created_at: string;
}

export default async function AdminLessonsPage() {
  const supabase = await createServerClient();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, slug, published, access_level, category_id, created_at")
    .order("created_at", { ascending: false }) as { data: LessonRow[] | null };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Lessons</h1>
        <Link
          href="/admin/lessons/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Lesson
        </Link>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Access</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons && lessons.length > 0 ? (
              lessons.map((lesson) => (
                <tr key={lesson.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/lessons/${lesson.id}`}
                      className="font-medium hover:underline"
                    >
                      {lesson.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                      {lesson.access_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        lesson.published
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {lesson.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/lessons/${lesson.id}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No lessons yet. Create your first lesson to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
