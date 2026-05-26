import type { Metadata } from "next";
import { EventForm } from "@/components/admin/event-form";

export const metadata: Metadata = {
  title: "New Event — XYQ Admin",
};

export default function NewEventPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Create Event</h1>
      <EventForm />
    </div>
  );
}
