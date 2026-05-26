import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants/routes";
import { MobileMenu } from "./mobile-menu";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          XYQ Full Combat
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {NAV_ITEMS.public.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Login
          </Link>
        </nav>

        <MobileMenu />
      </div>
    </header>
  );
}
