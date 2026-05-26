import type { Metadata } from "next";
import { SeminarForm } from "@/components/admin/seminar-form";

export const metadata: Metadata = {
  title: "New Seminar — XYQ Admin",
};

export default function NewSeminarPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Archive Seminar</h1>
      <SeminarForm />
    </div>
  );
}
