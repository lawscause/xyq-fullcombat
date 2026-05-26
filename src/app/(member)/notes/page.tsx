import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils/dates";
import type { Note } from "@/types/domain";

export const metadata: Metadata = {
  title: "Notes — XYQ Full Combat",
};

export default async function NotesPage() {
  const supabase = await createServerClient();

  const { data: notes } = await supabase
    .from("notes")
    .select(
      `
      id, content, created_at, updated_at,
      lesson:lessons (id, title, slug)
    `
    )
    .order("updated_at", { ascending: false }) as { data: Note[] | null };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Notes</h1>
        <p className="mt-1 text-muted-foreground">
          Private notes from your training. Only visible to you.
        </p>
      </div>

      <div className="space-y-3">
        {notes && notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="rounded-lg border bg-card p-4">
              {note.lesson && (
                <Link
                  href={`/lessons/${note.lesson.slug}`}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {note.lesson.title}
                </Link>
              )}
              <p className="mt-1 text-sm line-clamp-3">{note.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDate(note.updated_at)}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-lg border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Your private notes will appear here. Add notes from any lesson page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
