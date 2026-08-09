"use client";

import * as React from "react";

import { recommendConsultants } from "@/lib/api";
import type { Consultant } from "@/lib/types";
import { ConsultantCard } from "@/components/ConsultantCard";
import { SearchBar } from "@/components/SearchBar";

export default function ExplorePage() {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<Consultant[]>([]);

  async function runSearch() {
    const q = query.trim();
    if (!q) {
      setError("Please type a query.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await recommendConsultants(q);

      // Sort by domain match: if query contains domain keywords, prioritize those consultants
      const queryLower = q.toLowerCase();
      const domainKeywords: Record<string, string[]> = {
        health: ["health", "medical", "doctor", "wellness", "healthcare"],
        finance: ["finance", "money", "investment", "tax", "banking"],
        legal: ["legal", "law", "lawyer", "contract", "attorney"],
        technology: ["tech", "software", "developer", "programming", "it"],
        marketing: ["marketing", "advertising", "brand", "promotion"],
        startup: ["startup", "business", "entrepreneur", "venture"],
      };

      // Check if query matches any domain
      let matchedDomain: string | null = null;
      for (const [domain, keywords] of Object.entries(domainKeywords)) {
        if (keywords.some((kw) => queryLower.includes(kw))) {
          matchedDomain = domain;
          break;
        }
      }

      // Sort: matched domain first, then by score
      const sorted = [...data].sort((a, b) => {
        if (matchedDomain) {
          const aMatches = a.domain.toLowerCase() === matchedDomain;
          const bMatches = b.domain.toLowerCase() === matchedDomain;
          if (aMatches && !bMatches) return -1;
          if (!aMatches && bMatches) return 1;
        }
        return b.final_score - a.final_score;
      });

      setResults(sorted);
    } catch (e) {
      setResults([]);
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Explore consultants
        </h1>
        <p className="max-w-2xl text-gray-700">
          Describe what you need help with — we’ll match and rank consultants using relevance and experience.
        </p>
      </section>

      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={runSearch}
        loading={loading}
      />

      {error ? (
        <div className="rounded-3xl border border-coral-100 bg-coral-50 p-5 text-sm text-coral-900">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[210px] rounded-3xl border border-sage-100 bg-white/60 shadow-soft"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(255,255,255,0.4), rgba(79,154,119,0.08), rgba(255,255,255,0.4))",
                backgroundSize: "200% 100%",
              }}
            />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div>
          <div className="mb-4 text-sm text-gray-600">
            Showing {results.length} matches
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {results.map((c) => (
              <ConsultantCard key={`${c.name}-${c.domain}-${c.experience}`} consultant={c} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-sage-100 bg-white/60 p-8 text-sm text-gray-700 shadow-soft">
          No results yet — try searching to see your top matches.
        </div>
      )}
    </div>
  );
}
