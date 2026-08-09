"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

export function ConsultantRoleGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const role = window.localStorage.getItem("role");
    const consultantId = window.localStorage.getItem("consultant_id");

    if (role !== "consultant" || !consultantId) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return <div className="rounded-2xl border border-sage-100 bg-white p-6 text-sm text-gray-600">Checking access…</div>;
  }

  return <>{children}</>;
}
