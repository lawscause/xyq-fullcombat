import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDateTime } from "@/lib/utils/dates";
import type { Event } from "@/types/domain";

export const metadata: Metadata = {
  title: "Manage Events — XYQ Admin",
};

export default async function AdminEventsPage() {
  const supabase = await createServerClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: false }) as { data: Event[] | null };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Event
        </Link>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Event</th>
              <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Date</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Type</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events && events.length > 0 ? (
              events.map((event) => (
                <tr key={event.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="font-medium hover:underline"
                    >
                      {event.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    {formatDateTime(event.date)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                      {event.event_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {event.is_cancelled ? (
                      <span className="rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs">
                        Cancelled
                      </span>
                    ) : new Date(event.date) > new Date() ? (
                      <span className="rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs">
                        Upcoming
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        Past
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/events/${event.id}`}
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
                  No events yet. Create your first event.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
