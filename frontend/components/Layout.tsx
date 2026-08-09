import * as React from "react";

import { Navbar } from "@/components/Navbar";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-24 md:px-8">
        {children}
      </main>
      <footer className="border-t border-sage-100 bg-white/50">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-8 text-sm text-gray-600 md:px-8">
          <div className="font-medium">ConsultMatch</div>
          <div>Built for fast, calm decision-making.</div>
        </div>
      </footer>
    </div>
  );
}
