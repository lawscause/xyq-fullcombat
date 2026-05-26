import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { LessonForm } from "@/components/admin/lesson-form";
import type { Lesson } from "@/types/domain";

interface EditLessonPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Lesson — XYQ Admin",
};

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      `
      *,
      lesson_media (*),
      transcripts (*)
    `
    )
    .eq("id", id)
    .single() as { data: Lesson | null };

  if (!lesson) {
    notFound();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Lesson</h1>
      <LessonForm lesson={lesson} />
    </div>
  );
}
