import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — XYQ Full Combat",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Interested in training with us? We welcome serious students who
          are committed to long-term practice.
        </p>
        <p>
          The best way to get started is to attend a Saturday morning class.
          No prior martial arts experience is required, but please reach out
          first so we can expect you.
        </p>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-medium text-foreground">Get in Touch</h3>
          <p className="mt-2 text-sm">
            Email:{" "}
            <a
              href="mailto:info@xyqfullcombat.com"
              className="text-foreground underline underline-offset-4"
            >
              info@xyqfullcombat.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
