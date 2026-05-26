import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/admin/event-form";
import type { Event } from "@/types/domain";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Event — XYQ Admin",
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single() as { data: Event | null };

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Event</h1>
      <EventForm event={event} />
    </div>
  );
}
