import type { Metadata } from "next";
import { SearchInterface } from "@/components/shared/search-interface";

export const metadata: Metadata = {
  title: "Search — XYQ Full Combat",
};

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="mt-1 text-muted-foreground">
          Find lessons, seminars, techniques, and concepts.
        </p>
      </div>
      <SearchInterface />
    </div>
  );
}
