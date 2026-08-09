import { AIChatbot } from "@/components/AIChatbot";

export default function AIConsultantPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">AI Consultant</h1>
        <p className="max-w-2xl text-gray-700">
          Get structured guidance for business, finance, career, legal, productivity and growth.
        </p>
      </section>
      <AIChatbot />
    </div>
  );
}
