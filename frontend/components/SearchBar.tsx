"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar({
  value,
  onChange,
  onSubmit,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <div className="w-full rounded-3xl border border-sage-100 bg-white/70 p-4 shadow-soft backdrop-blur-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="What do you need help with?"
            className="pl-11"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
          />
        </div>
        <Button
          size="lg"
          className="h-12"
          disabled={loading}
          onClick={onSubmit}
        >
          {loading ? "Searching…" : "Search"}
        </Button>
      </div>
      <div className="mt-3 text-xs text-gray-600">
        Tip: try “startup funding + tax planning”, “career coaching”, “legal compliance”.
      </div>
    </div>
  );
}
