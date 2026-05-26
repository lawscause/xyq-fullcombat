import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instructors — XYQ Full Combat",
};

export default function InstructorsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Instructors</h1>
      <p className="mt-4 text-muted-foreground">
        Our instructors bring decades of combined experience in Xing Yi Quan
        and related internal martial arts.
      </p>

      <div className="mt-10 space-y-8">
        {/* Placeholder — populated from database in production */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-muted" />
            <div>
              <h3 className="font-medium">Instructor Name</h3>
              <p className="text-sm text-muted-foreground">Head Instructor</p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Bio and background information loaded from the database.
                Training lineage, specializations, and teaching philosophy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
