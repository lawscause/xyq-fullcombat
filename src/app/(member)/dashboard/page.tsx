import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { BookOpen, Calendar, FileText, Bell } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard — XYQ Full Combat",
};

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your training dashboard. Quick access to this week&apos;s material.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/practice"
          className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
        >
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="mt-2 font-medium text-sm">This Week</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Current practice material
          </p>
        </Link>
        <Link
          href="/lessons"
          className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
        >
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <h3 className="mt-2 font-medium text-sm">Lessons</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Browse the training library
          </p>
        </Link>
        <Link
          href="/events"
          className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
        >
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="mt-2 font-medium text-sm">Events</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Upcoming classes & seminars
          </p>
        </Link>
        <Link
          href="/practice"
          className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h3 className="mt-2 font-medium text-sm">Announcements</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Community updates
          </p>
        </Link>
      </div>

      {/* Recent Practice Posts */}
      <section>
        <h2 className="text-lg font-medium">Recent Practice</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Practice posts will appear here once content is added.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section>
        <h2 className="text-lg font-medium">Upcoming</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Upcoming events will appear here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
