import Link from "next/link";
import { Bot, CalendarCheck2, MessagesSquare, Sparkles, Target, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-sage-100 bg-white/70 p-10 shadow-soft md:p-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(189,228,210,0.35),transparent_45%),radial-gradient(circle_at_90%_10%,rgba(224,240,231,0.45),transparent_42%)]" />
        <div className="relative">
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-ink md:text-6xl">
            Find the Right Expert for Your Problem
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
            Consult experienced professionals across finance, legal, health, technology, and more.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/explore">Explore Consultants</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/ai-consultant">Talk to AI Consultant</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Platform capabilities</h2>
          <p className="mt-2 text-gray-700">Built for fast decisions, clear guidance, and real consultation outcomes.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: Bot, title: "AI Consultant", text: "Get structured help instantly with practical next steps." },
            { icon: Sparkles, title: "Hybrid AI matching", text: "Domain-aware recommendations from BM25 + embeddings." },
            { icon: Users, title: "Domain experts", text: "Connect with consultants across key professional categories." },
            { icon: CalendarCheck2, title: "Chat + booking", text: "Chat in-platform and schedule appointments seamlessly." },
          ].map((item) => (
            <Card key={item.title} className="transition hover:shadow-lift">
              <CardHeader>
                <item.icon className="h-6 w-6 text-sage-700" />
                <div className="mt-3 text-lg font-semibold">{item.title}</div>
              </CardHeader>
              <CardContent className="text-sm text-gray-700">{item.text}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How it works</h2>
          <p className="mt-2 text-gray-700">Three focused steps from question to consultation.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: MessagesSquare,
              title: "Describe your problem",
              step: "Step 1",
              text: "Share your issue in plain language so matching can start immediately.",
            },
            {
              icon: Target,
              title: "Get matched",
              step: "Step 2",
              text: "Our hybrid recommendation system ranks the most relevant consultants.",
            },
            {
              icon: CalendarCheck2,
              title: "Chat and book",
              step: "Step 3",
              text: "Start a conversation and book an appointment when you're ready.",
            },
          ].map((item) => (
            <Card key={item.title} className="transition hover:shadow-lift">
              <CardHeader>
                <div className="text-sm font-medium text-sage-700">{item.step}</div>
                <item.icon className="mt-2 h-6 w-6 text-sage-700" />
                <div className="mt-2 text-xl font-semibold">{item.title}</div>
              </CardHeader>
              <CardContent className="text-gray-700">{item.text}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Consultant domains</h2>
        <div className="flex flex-wrap gap-3">
          {["Finance", "Legal", "Health", "Startup", "Marketing", "Technology"].map((domain) => (
            <div
              key={domain}
              className="rounded-2xl border border-sage-100 bg-white px-4 py-2 text-sm font-medium text-sage-900 shadow-soft"
            >
              {domain}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-sage-100 bg-white/60 p-10 shadow-soft md:p-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">Start Your Consultation Today</h3>
            <p className="mt-2 max-w-xl text-gray-700">
              Choose your role and continue with user or consultant experience.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
