"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Role = "user" | "consultant";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem("role");
    const consultantId = window.localStorage.getItem("consultant_id");

    if (raw === "user" && window.localStorage.getItem("user_id")) {
      setRole("user");
      return;
    }

    if (raw === "consultant" && consultantId) {
      setRole("consultant");
      return;
    }

    setRole(null);
  }, [pathname]);

  function handleSwitchRole() {
    window.localStorage.removeItem("role");
    window.localStorage.removeItem("user_id");
    window.localStorage.removeItem("user_name");
    window.localStorage.removeItem("consultant_id");
    window.localStorage.removeItem("consultant_name");
    window.localStorage.removeItem("consultant_domain");
    setRole(null);
    router.push("/login");
  }

  const userLinks = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/chat", label: "Chat" },
    { href: "/ai-consultant", label: "AI Consultant" },
  ];

  const consultantLinks = [
    { href: "/consultant-dashboard", label: "Dashboard" },
    { href: "/consultant/chats", label: "Chats" },
    { href: "/consultant/clients", label: "Clients" },
    { href: "/consultant/appointments", label: "Appointments" },
    { href: "/consultant/blog", label: "Blog / Research" },
    { href: "/consultant/profile", label: "Profile" },
  ];

  const links = role === "consultant" ? consultantLinks : userLinks;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition",
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-soft border-b border-sage-100"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="group">
          <div className="text-base font-semibold tracking-tight">
            <span className="text-sage-700">Consult</span>
            <span className="text-ink">Match</span>
            <span className="ml-2 rounded-full bg-lavender-100 px-2 py-0.5 text-xs font-medium text-gray-700">beta</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-gray-700 md:flex">
          {links.map((item) => (
            <Link key={item.href} className="hover:text-ink transition" href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {role ? (
            <>
              <Button asChild variant="outline" className="hidden md:inline-flex">
                <Link href={role === "consultant" ? "/consultant-dashboard" : "/explore"}>
                  {role === "consultant" ? "Open Dashboard" : "Start Exploring"}
                </Link>
              </Button>
              <Button asChild className="md:hidden">
                <Link href={role === "consultant" ? "/consultant-dashboard" : "/explore"}>
                  {role === "consultant" ? "Dashboard" : "Explore"}
                </Link>
              </Button>
              <Button variant="ghost" className="hidden md:inline-flex" onClick={handleSwitchRole}>
                Switch Role
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
