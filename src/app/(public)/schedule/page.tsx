import type { Metadata } from "next";
import { MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Schedule — XYQ Full Combat",
};

export default function SchedulePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Class Schedule</h1>
      <p className="mt-4 text-muted-foreground">
        Regular weekly training. All levels welcome at Saturday class.
      </p>

      <div className="mt-10 space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-medium">Saturday Morning — All Levels</h3>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>9:00 AM – 11:00 AM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Location provided upon registration</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Foundations, five elements, and form work. Open to new students.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-medium">Wednesday Evening — Continuing Students</h3>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>6:30 PM – 8:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Location provided upon registration</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Applications, partner work, and advanced material.
            Requires instructor approval.
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-lg border border-border/50 bg-muted/50 p-6">
        <h3 className="font-medium">Weather & Cancellations</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Classes are held outdoors. In case of severe weather, cancellations
          are posted to the member dashboard by 7:00 AM day-of.
        </p>
      </div>
    </div>
  );
}
