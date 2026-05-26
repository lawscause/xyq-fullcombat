import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { PracticePostForm } from "@/components/admin/practice-post-form";
import type { PracticePost } from "@/types/domain";

interface EditPracticePostPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Practice Post — XYQ Admin",
};

export default async function EditPracticePostPage({ params }: EditPracticePostPageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: post } = await supabase
    .from("practice_posts")
    .select("*")
    .eq("id", id)
    .single() as { data: PracticePost | null };

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Practice Post</h1>
      <PracticePostForm post={post} />
    </div>
  );
}
