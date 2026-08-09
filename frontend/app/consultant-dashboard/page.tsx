"use client";

import Link from "next/link";
import { MessagesSquare, Users, BookOpenText, UserCircle2 } from "lucide-react";

import { ConsultantRoleGate } from "@/components/ConsultantRoleGate";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ConsultantDashboardPage() {
  return (
    <ConsultantRoleGate>
      <div className="space-y-6">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Consultant Dashboard</h1>
          <p className="max-w-2xl text-gray-700">Manage client conversations, insights, and your consultant profile.</p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: MessagesSquare,
              title: "Client Chats",
              text: "Reply to incoming user conversations.",
              href: "/consultant/chats",
            },
            {
              icon: Users,
              title: "Clients",
              text: "Track clients, topics, and appointment status.",
              href: "/consultant/clients",
            },
            {
              icon: BookOpenText,
              title: "Blog / Research",
              text: "Read updates across strategy, finance, legal, startup.",
              href: "/consultant/blog",
            },
            {
              icon: UserCircle2,
              title: "Profile",
              text: "Keep your expertise and bio up to date.",
              href: "/consultant/profile",
            },
          ].map((item) => (
            <Link key={item.title} href={item.href}>
              <Card className="h-full transition hover:shadow-lift">
                <CardHeader>
                  <item.icon className="h-6 w-6 text-sage-700" />
                  <div className="mt-3 text-lg font-semibold">{item.title}</div>
                </CardHeader>
                <CardContent className="text-sm text-gray-700">{item.text}</CardContent>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </ConsultantRoleGate>
  );
}
