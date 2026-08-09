import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

const posts = [
  {
    slug: "how-to-write-a-great-consulting-brief",
    title: "How to write a great consulting brief",
    excerpt:
      "A simple structure to describe your problem clearly so you get better matches.",
    date: "2026-03-02",
  },
  {
    slug: "ranking-not-recommending",
    title: "Ranking beats guessing: why we don’t do ‘AI magic’",
    excerpt:
      "We keep it simple: keyword relevance + rating + experience. Transparent scoring wins.",
    date: "2026-03-01",
  },
  {
    slug: "pick-the-right-domain",
    title: "Choosing the right domain for your problem",
    excerpt:
      "Business, finance, legal, marketing—how to narrow down quickly.",
    date: "2026-02-28",
  },
  {
    slug: "fast-first-call",
    title: "Your first call: questions that unlock clarity",
    excerpt:
      "A quick checklist to make the first 15 minutes count.",
    date: "2026-02-25",
  },
];

export default function BlogPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Blog</h1>
        <p className="max-w-2xl text-gray-700">
          Short reads on how to find help faster and work better with consultants.
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog#${p.slug}`} className="group">
            <Card className="transition hover:shadow-lift">
              <CardContent className="p-7">
                <div className="text-xs font-medium text-gray-500">{p.date}</div>
                <div className="mt-2 text-xl font-semibold tracking-tight group-hover:text-sage-700 transition">
                  {p.title}
                </div>
                <div className="mt-2 text-sm leading-relaxed text-gray-700">
                  {p.excerpt}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
