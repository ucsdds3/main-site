import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "src/Utils/supabase";
import { EventType } from "src/Utils/types";
import toast from "react-hot-toast";

import type { CheckInFeedbackTarget } from "../Components/CheckInFeedbackModal";

const quarters = {
  Fall: [new Date("2025-09-22"), new Date("2025-12-13")],
  Winter: [new Date("2026-01-02"), new Date("2026-03-13")],
  Spring: [new Date("2026-03-25"), new Date("2026-06-12")],
};

async function lookupEventByCode(
  eventCode: string
): Promise<{ id: number; name: string } | null> {
  const { data, error } = await supabase
    .from("Events")
    .select("id,name")
    .eq("password", eventCode.trim())
    .eq("deleted", false)
    .maybeSingle();

  if (error || !data) return null;
  return { id: Number(data.id), name: String(data.name ?? "Event") };
}

export function useEvents() {
  const [attendedEvents, setAttendedEvents] = useState<EventType[]>([]);
  const [feedbackTarget, setFeedbackTarget] = useState<CheckInFeedbackTarget | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchAttended = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_my_attendance");
      if (error) throw error;

      const rows = (data ?? []) as EventType[];
      setAttendedEvents(rows);
    } catch (err) {
      console.error("[fetchAttended] RPC error:", err);
      setAttendedEvents([]);
    }
  }, []);

  useEffect(() => {
    void fetchAttended();
  }, [fetchAttended]);

  const handleSubmitCode = useCallback(
    async (e: React.FormEvent, eventCode: string): Promise<string | undefined> => {
      e.preventDefault();

      if (!eventCode.trim()) {
        toast.error("Please enter an event code.");
        return;
      }

      const code = eventCode.trim();
      const { data, error } = await supabase.rpc("validate_event_code", {
        event_code: code,
      });

      if (error) {
        toast.error(error.message);
        console.error(error);
        return;
      }

      const status = data as string;

      if (status === "event_not_started") toast.error("The event hasn't started yet");
      else if (status === "event_expired") toast.error("The event has ended");
      else if (status === "not_authenticated") toast.error("Please log in first.");
      else if (status === "member_not_found")
        toast.error("Your account is not linked to a profile.");
      else if (status === "invalid_event") toast.error("Invalid event code.");
      else if (status === "registered") {
        toast.success("Checked in — tell us how it went!");
        void fetchAttended();
        const event = await lookupEventByCode(code);
        if (event) setFeedbackTarget({ eventId: event.id, eventName: event.name });
      } else if (status === "already_registered") {
        toast("Already checked in for this event.");
        void fetchAttended();
        // Still offer feedback if they reopen via QR / code (e.g. skipped earlier).
        const event = await lookupEventByCode(code);
        if (event) setFeedbackTarget({ eventId: event.id, eventName: event.name });
      } else toast.error("Unexpected server response.");

      return status;
    },
    [fetchAttended]
  );

  useEffect(() => {
    const eventcodeParam = searchParams.get("eventcode");
    if (!eventcodeParam) return;

    const run = async () => {
      const result = await handleSubmitCode(
        { preventDefault: () => {} } as React.FormEvent,
        eventcodeParam
      );
      const shouldRemoveParam =
        result === "registered" ||
        result === "already_registered" ||
        result === "invalid_event" ||
        result === "event_expired" ||
        result === "event_not_started";
      if (shouldRemoveParam) {
        const next = new URLSearchParams(searchParams);
        next.delete("eventcode");
        setSearchParams(next, { replace: true });
      }
    };
    void run();
    // Run once on mount for QR deep links.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot QR handling
  }, []);

  const getCurrentQuarter = (): [Date, Date] | null => {
    const today = new Date();
    for (const [, [start, end]] of Object.entries(quarters)) {
      if (today >= start && today <= end) {
        return [start, end];
      }
    }
    return null;
  };

  const eventStats = {
    "Events This Quarter": (() => {
      const currentQuarter = getCurrentQuarter();
      if (!currentQuarter) return 0;

      return attendedEvents.filter(event => {
        const eventDate = new Date(event.start ?? "");
        return eventDate >= currentQuarter[0] && eventDate <= currentQuarter[1];
      }).length;
    })(),
    "Events Attended Total": attendedEvents.length,
  };

  return {
    attendedEvents,
    handleSubmitCode,
    eventStats,
    feedbackTarget,
    clearFeedbackTarget: () => setFeedbackTarget(null),
    refreshAttended: fetchAttended,
  };
}
