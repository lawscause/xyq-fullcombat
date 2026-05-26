import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            XYQ Full Combat
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A private training platform for our Xing Yi Quan community.
            Practice material, seminar archives, and event coordination —
            supporting your training between classes.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Member Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-card px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="space-y-3">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
              <h3 className="font-medium">Training Archive</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Lessons organized by element, form, and application.
                Video, notes, and diagrams for every technique.
              </p>
            </div>
            <div className="space-y-3">
              <Calendar className="h-6 w-6 text-muted-foreground" />
              <h3 className="font-medium">Events & Seminars</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Weekly class schedule, workshop registration, and
                seminar recordings preserved for review.
              </p>
            </div>
            <div className="space-y-3">
              <Users className="h-6 w-6 text-muted-foreground" />
              <h3 className="font-medium">Community</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Stay connected between classes. Weekly practice posts,
                announcements, and discussion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto max-w-4xl text-center text-sm text-muted-foreground">
          <p>XYQ Full Combat — Private Training Community</p>
          <p className="mt-1">
            <Link href="/schedule" className="hover:text-foreground">
              Class Schedule
            </Link>
            {" · "}
            <Link href="/instructors" className="hover:text-foreground">
              Instructors
            </Link>
            {" · "}
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
