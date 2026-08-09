"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function AppointmentModal({
  open,
  consultantId,
  onClose,
  onConfirm,
}: {
  open: boolean;
  consultantId: string;
  onClose: () => void;
  onConfirm: (input: { date: string; time: string; notes: string }) => Promise<void>;
}) {
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setDate("");
      setTime("");
      setNotes("");
      setLoading(false);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <Card className="w-full max-w-lg rounded-3xl">
        <CardHeader>
          <div className="text-lg font-semibold text-ink">Book Appointment</div>
          <div className="mt-1 text-sm text-gray-600">With {consultantId}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">Date</div>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">Time</div>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">Notes</div>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
          </div>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setError(null);
              if (!date || !time) {
                setError("Please choose date and time");
                return;
              }
              setLoading(true);
              try {
                await onConfirm({ date, time, notes });
                onClose();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Booking failed");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? "Booking…" : "Confirm"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
