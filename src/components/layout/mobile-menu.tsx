"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Menu } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants/routes";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="sm:hidden rounded-md p-2 hover:bg-accent"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-72 border-l bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <span className="font-semibold tracking-tight">XYQ Full Combat</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 hover:bg-accent"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.public.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t my-4" />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground text-center hover:bg-primary/90"
              >
                Member Login
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
