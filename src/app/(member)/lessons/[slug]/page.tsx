import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { VideoPlayer } from "@/components/media/video-player";
import { BookmarkButton } from "@/components/lessons/bookmark-button";
import { LessonNotes } from "@/components/lessons/lesson-notes";
import type { Lesson } from "@/types/domain";

interface LessonPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("lessons")
    .select("title")
    .eq("slug", slug)
    .single() as { data: { title: string } | null };

  return {
    title: data ? `${data.title} — XYQ Full Combat` : "Lesson Not Found",
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      `
      *,
      lesson_media (*),
      transcripts (*),
      instructors:lesson_instructors (
        instructor:instructors (id, name, title)
      ),
      tags:lesson_tags (
        tag:tags (id, name, slug)
      )
    `
    )
    .eq("slug", slug)
    .eq("published", true)
    .single() as { data: Lesson | null };

  if (!lesson) {
    notFound();
  }

  const videoMedia = lesson.lesson_media?.find((m) => m.type === "video");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="mt-2 text-muted-foreground">{lesson.description}</p>
          )}
          {lesson.tags && lesson.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {lesson.tags.map((t) => (
                <span
                  key={t.tag.id}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {t.tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <BookmarkButton lessonId={lesson.id} />
      </div>

      {/* Video */}
      {videoMedia?.cloudflare_stream_id && (
        <VideoPlayer
          videoId={videoMedia.cloudflare_stream_id}
          title={lesson.title}
        />
      )}

      {/* Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Instructor Notes */}
          {lesson.instructor_notes && (
            <section>
              <h2 className="text-lg font-medium">Instructor Notes</h2>
              <div className="mt-3 prose prose-sm max-w-none text-muted-foreground">
                {lesson.instructor_notes}
              </div>
            </section>
          )}

          {/* Transcript */}
          {lesson.transcripts && lesson.transcripts.length > 0 && (
            <section>
              <h2 className="text-lg font-medium">Transcript</h2>
              <div className="mt-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground leading-relaxed max-h-96 overflow-y-auto">
                {lesson.transcripts[0].content}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <LessonNotes lessonId={lesson.id} />

          {/* Attachments */}
          {lesson.lesson_media && lesson.lesson_media.filter((m) => m.type !== "video").length > 0 && (
            <section>
              <h2 className="text-sm font-medium">Attachments</h2>
              <div className="mt-2 space-y-2">
                {lesson.lesson_media
                  .filter((m) => m.type !== "video")
                  .map((media) => (
                    <div
                      key={media.id}
                      className="rounded border bg-card p-2 text-xs"
                    >
                      {media.title} ({media.type})
                    </div>
                  ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
