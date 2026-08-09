"use client";

import { ConsultantRoleGate } from "@/components/ConsultantRoleGate";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const articles = [
  {
    category: "Business strategy",
    title: "How consultants can frame sharper problem statements",
    summary: "A practical structure for diagnosing root causes before suggesting actions.",
  },
  {
    category: "Finance insights",
    title: "What changed in personal finance planning this quarter",
    summary: "Quick updates on allocation, taxation signals, and client communication tips.",
  },
  {
    category: "Legal updates",
    title: "Client-facing checklist for early-stage compliance conversations",
    summary: "A lightweight framework to surface legal risk early in advisory projects.",
  },
  {
    category: "Startup ecosystem",
    title: "Founder advisory: reducing time-to-decision in GTM plans",
    summary: "How to keep startup consultations focused, measurable, and execution-ready.",
  },
];

export default function ConsultantBlogPage() {
  return (
    <ConsultantRoleGate>
      <div className="space-y-6">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Blog / Research</h1>
          <p className="max-w-2xl text-gray-700">Curated reading for consulting practice and client outcomes.</p>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          {articles.map((article) => (
            <Card key={article.title} className="h-full">
              <CardHeader>
                <div className="text-xs font-medium uppercase tracking-wide text-sage-700">{article.category}</div>
                <div className="mt-2 text-lg font-semibold text-ink">{article.title}</div>
              </CardHeader>
              <CardContent className="text-sm text-gray-700">{article.summary}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ConsultantRoleGate>
  );
}
