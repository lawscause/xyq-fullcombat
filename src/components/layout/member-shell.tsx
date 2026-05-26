"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  BookOpen,
  Calendar,
  FileText,
  Home,
  Menu,
  Notebook,
  Search,
  Settings,
  Shield,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface MemberShellProps {
  user: User;
  role: string;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Practice", href: "/practice", icon: FileText },
  { label: "Lessons", href: "/lessons", icon: BookOpen },
  { label: "Seminars", href: "/seminars", icon: Video },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Notes", href: "/notes", icon: Notebook },
];

// Bottom nav shows these 4 + a "More" button
const BOTTOM_NAV_ITEMS = NAV_ITEMS.slice(0, 4);

export function MemberShell({ user, role, children }: MemberShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStaff = role === "admin" || role === "instructor";
  const displayName = user.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            XYQ
          </Link>

          <div className="flex items-center gap-2">
            {isStaff && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground border hover:bg-accent hover:text-foreground"
                title="Admin Panel"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
            <Link
              href="/search"
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              href="/account"
              className="hidden sm:flex rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Account settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
            {/* Mobile menu trigger */}
            <button
              className="lg:hidden rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 border-l bg-background p-6 shadow-lg overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-muted-foreground">
                Hi, {displayName}
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md p-1 hover:bg-accent"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors",
                      isActive
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
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Search className="h-4 w-4" />
                Search
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Account
              </Link>

              {isStaff && (
                <>
                  <div className="border-t my-3" />
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                </>
              )}

              <div className="border-t my-3" />
              <SignOutButton />
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar + Content */}
      <div className="container flex gap-8 py-6">
        {/* Desktop Sidebar */}
        <aside className="hidden w-48 shrink-0 lg:block">
          <nav className="sticky top-20 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent font-medium text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            {isStaff && (
              <>
                <div className="border-t my-3" />
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    pathname.startsWith("/admin")
                      ? "bg-accent font-medium text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              </>
            )}

            <div className="pt-4 border-t mt-4">
              <SignOutButton />
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden">
        <div className="flex items-center justify-around py-2">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
                aria-label={item.label}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
          {/* More button triggers the slide-out */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground"
            aria-label="More"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}
