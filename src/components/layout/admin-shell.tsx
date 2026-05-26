"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calendar,
  FileText,
  Home,
  Menu,
  Users,
  Video,
  X,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: Home, exact: true },
  { label: "Lessons", href: "/admin/lessons", icon: BookOpen, exact: false },
  { label: "Seminars", href: "/admin/seminars", icon: Video, exact: false },
  { label: "Events", href: "/admin/events", icon: Calendar, exact: false },
  { label: "Practice", href: "/admin/practice", icon: FileText, exact: false },
  { label: "Users", href: "/admin/users", icon: Users, exact: false },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function isActive(item: (typeof ADMIN_NAV)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to site</span>
            </Link>
            <span className="text-border">|</span>
            <span className="font-semibold tracking-tight">Admin</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive(item)
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu trigger */}
          <button
            className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-accent"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open admin menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-64 border-l bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold">Admin</span>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="rounded-md p-1 hover:bg-accent"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {ADMIN_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors",
                      isActive(item)
                        ? "bg-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t my-3" />
              <Link
                href="/dashboard"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to site
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      {pathname !== "/admin" && (
        <div className="border-b bg-muted/30">
          <div className="container py-2">
            <Breadcrumb pathname={pathname} />
          </div>
        </div>
      )}

      <main className="container py-8">{children}</main>
    </div>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items
  const items = segments.map((segment, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-1.5">
          {i > 0 && <span>/</span>}
          {item.isLast ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
