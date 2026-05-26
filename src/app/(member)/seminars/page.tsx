import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils/dates";
import type { Seminar } from "@/types/domain";

export const metadata: Metadata = {
  title: "Seminars — XYQ Full Combat",
};

export default async function SeminarsPage() {
  const supabase = await createServerClient();

  const { data: seminars } = await supabase
    .from("seminars")
    .select(
      `id, title, slug, description, date, instructor_name, has_recording, thumbnail_url`
    )
    .eq("published", true)
    .order("date", { ascending: false }) as { data: Seminar[] | null };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Seminar Archive
        </h1>
        <p className="mt-1 text-muted-foreground">
          Recordings and materials from past workshops and guest instructor events.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {seminars && seminars.length > 0 ? (
          seminars.map((seminar) => (
            <Link
              key={seminar.id}
              href={`/seminars/${seminar.slug}`}
              className="rounded-lg border bg-card p-5 transition-colors hover:bg-accent"
            >
              <h3 className="font-medium">{seminar.title}</h3>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(seminar.date)}
                </span>
                {seminar.instructor_name && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {seminar.instructor_name}
                  </span>
                )}
              </div>
              {seminar.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {seminar.description}
                </p>
              )}
              {seminar.has_recording && (
                <span className="mt-3 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Recording available
                </span>
              )}
            </Link>
          ))
        ) : (
          <div className="col-span-full rounded-lg border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Seminar recordings will appear here as they are archived.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
