import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          About ConsultMatch
        </h1>
        <p className="max-w-2xl text-gray-700">
          ConsultMatch helps you find the right consultant faster — without scrolling endless lists.
        </p>
      </section>

      <Card>
        <CardContent className="p-8 md:p-10">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">What this platform does</h2>
              <p className="mt-2 text-gray-700">
                You type what you need help with. We instantly return the top matches ranked by relevance.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">How matching works</h2>
              <div className="mt-3 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-sage-100 bg-white/70 p-5">
                  <div className="text-sm font-medium text-sage-700">50%</div>
                  <div className="mt-1 font-semibold">Keyword similarity</div>
                  <div className="mt-2 text-sm text-gray-700">
                    TF‑IDF + cosine similarity over consultant bios.
                  </div>
                </div>
                <div className="rounded-3xl border border-sage-100 bg-white/70 p-5">
                  <div className="text-sm font-medium text-sage-700">30%</div>
                  <div className="mt-1 font-semibold">Rating</div>
                  <div className="mt-2 text-sm text-gray-700">
                    Normalized rating contributes to the final rank.
                  </div>
                </div>
                <div className="rounded-3xl border border-sage-100 bg-white/70 p-5">
                  <div className="text-sm font-medium text-sage-700">20%</div>
                  <div className="mt-1 font-semibold">Experience</div>
                  <div className="mt-2 text-sm text-gray-700">
                    Years of experience normalized across the dataset.
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Mission</h2>
              <p className="mt-2 text-gray-700">
                Calm, confident decisions — backed by simple, transparent ranking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
