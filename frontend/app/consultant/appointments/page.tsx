"use client";

import * as React from "react";

import { ConsultantRoleGate } from "@/components/ConsultantRoleGate";
import { getAppointmentsForConsultant } from "@/lib/chatApi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Appointment = {
  id: string;
  user_id: string;
  consultant_id: string;
  date: string;
  time: string;
  notes: string;
  status: string;
  created_at: string;
};

export default function ConsultantAppointmentsPage() {
  const [consultantId, setConsultantId] = React.useState<string | null>(null);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Get consultant ID from localStorage
  React.useEffect(() => {
    const id = window.localStorage.getItem("consultant_id");
    setConsultantId(id);
  }, []);

  // Fetch appointments
  React.useEffect(() => {
    if (!consultantId) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const appts = await getAppointmentsForConsultant(consultantId);
        if (!cancelled) setAppointments(appts);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load appointments");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [consultantId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-50 text-blue-900 ring-blue-100";
      case "completed":
        return "bg-green-50 text-green-900 ring-green-100";
      case "cancelled":
        return "bg-red-50 text-red-900 ring-red-100";
      default:
        return "bg-gray-50 text-gray-900 ring-gray-100";
    }
  };

  return (
    <ConsultantRoleGate>
      <div className="space-y-6">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Appointments</h1>
          <p className="max-w-2xl text-gray-700">View and manage your scheduled appointments with clients.</p>
        </section>

        {error && (
          <div className="rounded-2xl border border-coral-200 bg-coral-50 p-3 text-sm text-coral-900">
            {error}
          </div>
        )}

        <div className="grid gap-5">
          {loading ? (
            <div className="text-sm text-gray-600">Loading appointments…</div>
          ) : appointments.length === 0 ? (
            <div className="rounded-2xl border border-sage-100 bg-white/60 p-6 text-sm text-gray-600">
              No appointments scheduled yet.
            </div>
          ) : (
            appointments.map((appt) => (
              <Card key={appt.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-ink">{appt.user_id}</div>
                      <div className="mt-1 text-sm text-gray-600">
                        {new Date(`${appt.date}T${appt.time}`).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(appt.status)} ring-1`}>
                      {appt.status}
                    </Badge>
                  </div>
                </CardHeader>
                {appt.notes && (
                  <CardContent>
                    <div className="text-sm text-gray-700">Notes: {appt.notes}</div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </ConsultantRoleGate>
  );
}
