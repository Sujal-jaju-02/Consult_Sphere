"use client";

import * as React from "react";

import { ConsultantRoleGate } from "@/components/ConsultantRoleGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ConsultantProfilePage() {
  const [name, setName] = React.useState("");
  const [domain, setDomain] = React.useState("");
  const [experience, setExperience] = React.useState("");
  const [skills, setSkills] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  return (
    <ConsultantRoleGate>
      <div className="space-y-6">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Consultant Profile</h1>
          <p className="max-w-2xl text-gray-700">Keep your profile aligned with matching fields used in recommendations.</p>
        </section>

        <div className="space-y-4 rounded-3xl border border-sage-100 bg-white/70 p-6 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Domain" />
            <Input
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Years of experience"
            />
            <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills (comma separated)" />
          </div>

          <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio" />
          <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Profile photo URL" />

          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
              }}
            >
              Save profile
            </Button>
            {saved ? <span className="text-sm text-sage-800">Profile saved locally.</span> : null}
          </div>
        </div>
      </div>
    </ConsultantRoleGate>
  );
}
