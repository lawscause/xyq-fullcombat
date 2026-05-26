import type { Metadata } from "next";
import { PracticePostForm } from "@/components/admin/practice-post-form";

export const metadata: Metadata = {
  title: "New Practice Post — XYQ Admin",
};

export default function NewPracticePostPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New Practice Post</h1>
      <PracticePostForm />
    </div>
  );
}
