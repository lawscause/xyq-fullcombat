import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — XYQ Full Combat",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
        <p>
          XYQ Full Combat is a Xing Yi Quan training community focused on
          martial effectiveness, health, and the preservation of traditional
          knowledge through disciplined practice.
        </p>
        <p>
          We train weekly in the park, host regular workshops and seminars
          with guest instructors, and maintain this platform as a resource
          for students to review material, stay connected during travel, and
          deepen their understanding over time.
        </p>
        <p>
          This is a private community. Membership is by invitation or
          through attending our public introductory classes.
        </p>
      </div>
    </div>
  );
}
