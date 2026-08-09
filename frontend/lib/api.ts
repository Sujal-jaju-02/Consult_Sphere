import type { RecommendResponse } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

export async function recommendConsultants(query: string): Promise<RecommendResponse> {
  const res = await fetch(`${API_BASE_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    let detail = "Request failed";
    try {
      const data = (await res.json()) as { detail?: string };
      if (data?.detail) detail = data.detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  return (await res.json()) as RecommendResponse;
}
