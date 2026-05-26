import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { Users, BookOpen, Calendar, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin — XYQ Full Combat",
};

export default async function AdminDashboardPage() {
  const supabase = await createServerClient();

  // Fetch summary stats
  const [
    { count: userCount },
    { count: lessonCount },
    { count: eventCount },
    { count: activeMembers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("lessons").select("*", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("date", new Date().toISOString()),
    supabase
      .from("memberships")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const stats = [
    { label: "Total Users", value: userCount || 0, icon: Users },
    { label: "Lessons", value: lessonCount || 0, icon: BookOpen },
    { label: "Upcoming Events", value: eventCount || 0, icon: Calendar },
    { label: "Active Members", value: activeMembers || 0, icon: CreditCard },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Admin Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg border bg-card p-5">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border bg-card p-6">
          <h2 className="font-medium">Quick Actions</h2>
          <div className="mt-4 space-y-2">
            <a
              href="/admin/lessons/new"
              className="block rounded-md border p-3 text-sm hover:bg-accent"
            >
              Create new lesson
            </a>
            <a
              href="/admin/events/new"
              className="block rounded-md border p-3 text-sm hover:bg-accent"
            >
              Create new event
            </a>
            <a
              href="/admin/practice/new"
              className="block rounded-md border p-3 text-sm hover:bg-accent"
            >
              Post weekly practice
            </a>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6">
          <h2 className="font-medium">Recent Activity</h2>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Activity feed will show recent signups, comments, and content
              updates.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
