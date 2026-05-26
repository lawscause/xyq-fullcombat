import type { Metadata } from "next";
import { LessonForm } from "@/components/admin/lesson-form";

export const metadata: Metadata = {
  title: "New Lesson — XYQ Admin",
};

export default function NewLessonPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Create Lesson</h1>
      <LessonForm />
    </div>
  );
}
