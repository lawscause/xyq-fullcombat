import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BookOpen, Calendar, FileText, Plus } from "lucide-react";
import Link from "next/link";
import type { PracticePost, Event } from "@/types/domain";
import { formatRelative, formatEventDate } from "@/lib/utils/dates";

export const metadata: Metadata = {
  title: "Dashboard — XYQ Full Combat",
};

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] || "there";

  // Get user role
  const adminClient = createAdminClient();
  const { data: roles } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user!.id);
  const role = (roles?.[0] as { role: string } | undefined)?.role || "trial";
  const isStaff = role === "admin" || role === "instructor";

  // Fetch recent practice posts
  const { data: posts } = await supabase
    .from("practice_posts")
    .select("id, title, post_type, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3) as { data: Pick<PracticePost, "id" | "title" | "post_type" | "created_at">[] | null };

  // Fetch upcoming events
  const { data: events } = await supabase
    .from("events")
    .select("id, title, date, event_type, location")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(3) as { data: Pick<Event, "id" | "title" | "date" | "event_type" | "location">[] | null };

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hey, {displayName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isStaff
            ? "Your training dashboard. Manage content or review this week's material."
            : "Your training dashboard. Quick access to this week's material."}
        </p>
      </div>

      {/* Staff Quick Actions */}
      {isStaff && (
        <div className="rounded-lg border border-dashed bg-muted/30 p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Instructor Actions
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/practice/new"
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Post Practice
            </Link>
            <Link
              href="/admin/lessons/new"
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Lesson
            </Link>
            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Event
            </Link>
          </div>
        </div>
      )}

      {/* Quick Navigation */}
      <div className="grid gap-4 sm:grid-cols-3">
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
      </div>

      {/* Recent Practice Posts */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent Practice</h2>
          <Link
            href="/practice"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            View all →
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <Link
                key={post.id}
                href="/practice"
                className="block rounded-lg border bg-card p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      {post.post_type}
                    </span>
                    <h3 className="text-sm font-medium">{post.title}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(post.created_at)}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                {isStaff
                  ? "No practice posts yet. Create one from the admin panel to share with students."
                  : "Practice posts will appear here once content is added."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Upcoming</h2>
          <Link
            href="/events"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            View all →
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {events && events.length > 0 ? (
            events.map((event) => (
              <Link
                key={event.id}
                href="/events"
                className="block rounded-lg border bg-card p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      {event.event_type}
                    </span>
                    <h3 className="text-sm font-medium">{event.title}</h3>
                    {event.location && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.location}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatEventDate(event.date)}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                {isStaff
                  ? "No upcoming events. Create one from the admin panel."
                  : "Upcoming events will appear here."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
