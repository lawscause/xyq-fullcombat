import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/events/event-card";
import type { Event } from "@/types/domain";

export const metadata: Metadata = {
  title: "Events — XYQ Full Combat",
};

export default async function EventsPage() {
  const supabase = await createServerClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true }) as { data: Event[] | null };

  const { data: pastEvents } = await supabase
    .from("events")
    .select("*")
    .lt("date", new Date().toISOString())
    .order("date", { ascending: false })
    .limit(5) as { data: Event[] | null };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="mt-1 text-muted-foreground">
          Upcoming classes, workshops, and seminars.
        </p>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="text-lg font-medium">Upcoming</h2>
        <div className="mt-4 space-y-3">
          {events && events.length > 0 ? (
            events.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                No upcoming events scheduled.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      {pastEvents && pastEvents.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-muted-foreground">Recent Past</h2>
          <div className="mt-4 space-y-3 opacity-75">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} isPast />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
