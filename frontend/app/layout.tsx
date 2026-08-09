import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { SiteLayout } from "@/components/Layout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ConsultMatch",
  description: "Find the right consultant instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
