import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "src/Utils/supabase";
import { EventType } from "src/Utils/types";
import toast from "react-hot-toast";

const quarters = {
  Fall: [new Date("2025-09-22"), new Date("2025-12-13")],
  Winter: [new Date("2026-01-02"), new Date("2026-03-13")],
  Spring: [new Date("2026-03-25"), new Date("2026-06-12")],
};

export function useEvents() {
  const [attendedEvents, setAttendedEvents] = useState<EventType[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchAttended = async () => {
    try {
      const { data, error } = await supabase.rpc("get_my_attendance");
      if (error) throw error;

      const rows = (data ?? []) as EventType[];
      setAttendedEvents(rows);
    } catch (err) {
      console.error("[fetchAttended] RPC error:", err);
      setAttendedEvents([]);
    }
  };

  useEffect(() => {
    fetchAttended();
  }, []);

  useEffect(() => {
    console.log(searchParams, "SEARCH PARAMS");
    const eventcodeParam = searchParams.get("eventcode");
    if (eventcodeParam) {
      handleSubmitCode({ preventDefault: () => {} } as React.FormEvent, eventcodeParam);
      searchParams.delete("eventcode");
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const handleSubmitCode = async (e: React.FormEvent, eventCode: string) => {
    e.preventDefault();

    if (!eventCode.trim()) {
      toast.error("Please enter an event code.");
      return;
    }

    const { data, error } = await supabase.rpc("validate_event_code", {
      event_code: eventCode.trim(),
    });

    if (error) {
      toast.error(error.message);
      console.error(error);
      return;
    }

    if (data === "already_registered") toast("Already registered for this event!");
    else if (data === "event_not_started") toast.error("The event hasn't begun yet");
    else if (data === "event_expired") toast.error("The event has passed");
    else if (data === "not_authenticated") toast.error("Please log in first.");
    else if (data === "member_not_found") toast.error("Your account is not linked to a profile.");
    else if (data === "invalid_event") toast.error("Invalid event code.");
    else if (data === "registered") {
      toast.success("Event registration successful!");
      fetchAttended();
    } else toast.error("Unexpected server response.");
  };

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
  };
}
