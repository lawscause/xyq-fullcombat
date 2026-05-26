import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils/dates";
import type { Seminar } from "@/types/domain";

export const metadata: Metadata = {
  title: "Manage Seminars — XYQ Admin",
};

export default async function AdminSeminarsPage() {
  const supabase = await createServerClient();

  const { data: seminars } = await supabase
    .from("seminars")
    .select("*")
    .order("date", { ascending: false }) as { data: Seminar[] | null };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Seminars</h1>
        <Link
          href="/admin/seminars/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Seminar
        </Link>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Date</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Instructor</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {seminars && seminars.length > 0 ? (
              seminars.map((seminar) => (
                <tr key={seminar.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/seminars/${seminar.id}`}
                      className="font-medium hover:underline"
                    >
                      {seminar.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    {formatDate(seminar.date)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {seminar.instructor_name || "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        seminar.published
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {seminar.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/seminars/${seminar.id}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No seminars yet. Archive your first seminar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
