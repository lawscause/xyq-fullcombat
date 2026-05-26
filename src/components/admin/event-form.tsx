"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Event } from "@/types/domain";

interface EventFormProps {
  event?: Event;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const isEditing = !!event;

  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [date, setDate] = useState(
    event?.date ? new Date(event.date).toISOString().slice(0, 16) : ""
  );
  const [location, setLocation] = useState(event?.location || "");
  const [eventType, setEventType] = useState<Event["event_type"]>(
    event?.event_type || "class"
  );
  const [capacity, setCapacity] = useState(event?.capacity?.toString() || "");
  const [priceCents, setPriceCents] = useState(
    event?.price_cents ? (event.price_cents / 100).toString() : ""
  );
  const [isCancelled, setIsCancelled] = useState(event?.is_cancelled || false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createClient();

    const eventData = {
      title,
      description: description || null,
      date: new Date(date).toISOString(),
      location: location || null,
      event_type: eventType,
      capacity: capacity ? parseInt(capacity, 10) : null,
      price_cents: priceCents ? Math.round(parseFloat(priceCents) * 100) : null,
      is_cancelled: isCancelled,
    };

    try {
      if (isEditing) {
        const { error: updateError } = await (supabase
          .from("events") as any)
          .update(eventData)
          .eq("id", event!.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await (supabase
          .from("events") as any)
          .insert(eventData);

        if (insertError) throw insertError;
      }

      router.push("/admin/events");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-lg border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Saturday Morning Class"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will be covered, what to bring, etc."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[100px] resize-y placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">Date & Time</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Riverside Park, North Field"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="type">Event Type</Label>
            <select
              id="type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as Event["event_type"])}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="class">Class</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="guest">Guest Instructor</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Leave blank for unlimited"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={priceCents}
              onChange={(e) => setPriceCents(e.target.value)}
              placeholder="0 = free"
              min="0"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center gap-2 pt-2">
            <input
              id="cancelled"
              type="checkbox"
              checked={isCancelled}
              onChange={(e) => setIsCancelled(e.target.checked)}
              className="rounded border"
            />
            <Label htmlFor="cancelled" className="text-sm font-normal">
              Mark as cancelled (weather, etc.)
            </Label>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Update Event" : "Create Event"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/events")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
