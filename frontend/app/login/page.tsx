"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { BriefcaseBusiness, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type AuthMode = "role-select" | "user-login" | "consultant-login";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = React.useState<AuthMode>("role-select");
  const [userName, setUserName] = React.useState("");
  const [consultantName, setConsultantName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const role = window.localStorage.getItem("role");
    const consultantId = window.localStorage.getItem("consultant_id");
    const userId = window.localStorage.getItem("user_id");
    if (role === "user" && userId) {
      router.replace("/explore");
    } else if (role === "consultant" && consultantId) {
      router.replace("/consultant-dashboard");
    }
  }, [router]);

  function handleUserLogin() {
    const name = (userName || "").trim();
    if (!name) {
      setError("Please enter your name");
      return;
    }
    window.localStorage.setItem("role", "user");
    window.localStorage.setItem("user_id", name);
    window.localStorage.setItem("user_name", name);
    router.push("/explore");
  }

  function handleConsultantLogin() {
    const name = (consultantName || "").trim();
    if (!name) {
      setError("Please enter your name (as it appears in search results)");
      return;
    }
    window.localStorage.setItem("role", "consultant");
    window.localStorage.setItem("consultant_id", name);
    window.localStorage.setItem("consultant_name", name);
    router.push("/consultant-dashboard");
  }

  if (authMode === "role-select") {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="space-y-3 text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Choose your role</h1>
          <p className="text-gray-700">Login as a user to find experts or as a consultant to manage clients.</p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <Card className="transition hover:shadow-lift">
            <CardHeader>
              <UserRound className="h-7 w-7 text-sage-700" />
              <div className="mt-3 text-xl font-semibold">Login as User</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">Search consultants, chat, ask AI, and book appointments.</p>
              <Button className="w-full" onClick={() => { setError(null); setAuthMode("user-login"); }}>
                Continue as User
              </Button>
            </CardContent>
          </Card>

          <Card className="transition hover:shadow-lift">
            <CardHeader>
              <BriefcaseBusiness className="h-7 w-7 text-sage-700" />
              <div className="mt-3 text-xl font-semibold">Login as Consultant</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">View client chats, manage profile, and follow research insights.</p>
              <Button className="w-full" onClick={() => { setError(null); setAuthMode("consultant-login"); }}>
                Continue as Consultant
              </Button>
            </CardContent>
          </Card>
        </section>

        <div className="text-center text-sm text-gray-600">
          Need public pages first? <Link href="/" className="font-medium text-sage-800 underline">Go back home</Link>
        </div>
      </div>
    );
  }

  if (authMode === "user-login") {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <section className="space-y-3 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">User Login</h1>
          <p className="text-sm text-gray-700">Enter your name so consultants know who they're talking to</p>
        </section>

        <Card>
          <CardContent className="space-y-4 pt-6">
            {error && (
              <div className="rounded-lg border border-coral-200 bg-coral-50 p-3 text-sm text-coral-900">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleUserLogin(); }}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sage-500"
                placeholder="e.g., Alex Johnson"
                autoFocus
              />
            </div>

            <Button className="w-full" onClick={handleUserLogin}>
              Start Exploring
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => { setAuthMode("role-select"); setError(null); setUserName(""); }}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <section className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Consultant Login</h1>
        <p className="text-sm text-gray-700">Enter your name to access your chats and clients</p>
      </section>

      <Card>
        <CardContent className="space-y-4 pt-6">
          {error && (
            <div className="rounded-lg border border-coral-200 bg-coral-50 p-3 text-sm text-coral-900">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Your Full Name</label>
            <input
              type="text"
              value={consultantName}
              onChange={(e) => setConsultantName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleConsultantLogin(); }}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sage-500"
              placeholder="e.g., Pooja Sharma"
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-600">Use the name you found in search results</p>
          </div>

          <Button className="w-full" onClick={handleConsultantLogin}>
            Login
          </Button>

          <Button
            variant="secondary"
            className="w-full"
            onClick={() => { setAuthMode("role-select"); setError(null); setConsultantName(""); }}
          >
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
