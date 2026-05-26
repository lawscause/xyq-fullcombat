"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  type: "lesson" | "seminar";
  description: string | null;
}

export function SearchInterface() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    const supabase = createClient();

    // Search lessons
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, title, slug, description")
      .eq("published", true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10) as { data: { id: string; title: string; slug: string; description: string | null }[] | null };

    // Search seminars
    const { data: seminars } = await supabase
      .from("seminars")
      .select("id, title, slug, description")
      .eq("published", true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10) as { data: { id: string; title: string; slug: string; description: string | null }[] | null };

    const combined: SearchResult[] = [
      ...(lessons || []).map((l) => ({ ...l, type: "lesson" as const })),
      ...(seminars || []).map((s) => ({ ...s, type: "seminar" as const })),
    ];

    setResults(combined);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search techniques, concepts, instructors..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
          autoFocus
        />
      </form>

      {loading && (
        <p className="text-sm text-muted-foreground">Searching...</p>
      )}

      {searched && !loading && results.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No results found for &ldquo;{query}&rdquo;
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              href={
                result.type === "lesson"
                  ? `/lessons/${result.slug}`
                  : `/seminars/${result.slug}`
              }
              className="block rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
                  {result.type}
                </span>
                <h3 className="font-medium text-sm">{result.title}</h3>
              </div>
              {result.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {result.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
