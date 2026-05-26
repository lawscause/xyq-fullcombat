import { Calendar, MapPin, Users } from "lucide-react";
import { formatEventDate, formatEventTime } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    date: string;
    location: string | null;
    event_type: "class" | "workshop" | "seminar" | "guest";
    capacity: number | null;
    registered_count?: number;
    is_cancelled?: boolean;
  };
  isPast?: boolean;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  class: "Class",
  workshop: "Workshop",
  seminar: "Seminar",
  guest: "Guest Instructor",
};

export function EventCard({ event, isPast }: EventCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors",
        isPast && "opacity-60",
        event.is_cancelled && "border-destructive/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
          </span>
          <h3 className="mt-1 font-medium">
            {event.title}
            {event.is_cancelled && (
              <span className="ml-2 text-xs text-destructive font-normal">
                Cancelled
              </span>
            )}
          </h3>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatEventDate(event.date)} at {formatEventTime(event.date)}
        </span>
        {event.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.location}
          </span>
        )}
        {event.capacity && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {event.registered_count || 0}/{event.capacity} spots
          </span>
        )}
      </div>

      {event.description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>
      )}
    </div>
  );
}
