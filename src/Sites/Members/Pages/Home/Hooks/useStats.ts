import { useEffect, useState } from "react";
import { supabase } from "src/Utils/supabase";

import { EventType } from "src/Utils/types";
import { useAuthStore } from "../../../Hooks/useAuthStore";
import toast from "react-hot-toast";

export const tiers = {
  Rookie: "text-primary", // 0 - 1000 xp
  Bronze: "text-yellow-700", // 1000 - 2000 xp
  Silver: "text-gray-400", // 2000 - 4000 xp
  Gold: "text-yellow-300", // 4000 - 8000 xp
  Platinum: "text-secondary", // 8000 - 16000 xp
};

const quarters = {
  Fall: [new Date("2025-09-22"), new Date("2025-12-13")],
  Winter: [new Date("2026-01-02"), new Date("2026-03-13")],
  Spring: [new Date("2026-03-25"), new Date("2026-06-12")],
};

export type AttendedEvent = EventType & {
  attended_at: string;
};

export function useStats() {
  const { user } = useAuthStore();
  const [xp, setXp] = useState(0);
  const [points, setPoints] = useState(0);
  const [attendedEvents, setAttendedEvents] = useState<AttendedEvent[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      if (!user?.email) return;
      const { data, error } = await supabase
        .from("Members")
        .select("experience,points")
        .eq("email", user.email)
        .single();
      if (!isMounted) return;

      if (error) {
        console.error("Error fetching stats:", error);
        return;
      }

      if (data) {
        setXp((data.experience ?? 0) * 10);
        setPoints(data.points ?? 0);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const level = Math.max(Math.floor(Math.log2(xp / 1000)) + 1, 0);
  const offset = Number(xp >= 1000);
  const xpNeeded = 1000 * Math.pow(2, level - offset);
  const progress = xp / xpNeeded - offset;
  const [tier, color] = Object.entries(tiers)[level];

  const fetchAttended = async () => {
    try {
      const { data, error } = await supabase.rpc("get_my_attendance");
      if (error) throw error;

      const rows = (data ?? []) as AttendedEvent[];
      setAttendedEvents(rows);
    } catch (err) {
      console.error("[fetchAttended] RPC error:", err);
      setAttendedEvents([]);
    }
  };

  useEffect(() => {
    fetchAttended();
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
      console.log(currentQuarter);
      if (!currentQuarter) return 0;

      return attendedEvents.filter(event => {
        const eventDate = new Date(event.start ?? "");
        console.log(eventDate);
        console.log(eventDate >= currentQuarter[0] && eventDate <= currentQuarter[1]);
        return eventDate >= currentQuarter[0] && eventDate <= currentQuarter[1];
      }).length;
    })(),
    "Events Attended Total": attendedEvents.length,
  };

  return {
    xp,
    xpNeeded,
    progress,
    tier: {
      name: tier,
      color: color,
    },
    nextTier: {
      name: Object.keys(tiers)[level + 1],
      color: Object.values(tiers)[level + 1],
    },
    points,
    attendedEvents,
    handleSubmitCode,
    eventStats,
  };
}
