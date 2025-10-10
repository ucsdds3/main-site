import { MdOpenInNew } from "react-icons/md";
import Section from "../../../Components/Section";
import { useState, useEffect } from "react";
import { supabase } from "../../../Utils/supabase";
import toast from "react-hot-toast";
import AttendedCard from "../Events/AttendedCard";
import { FaArrowRight } from "react-icons/fa";

type AttendedRow = {
  attendance_id: number;
  attended_at: string; // ISO
  points: number | null;
  event_id: number;
  event_name: string;
  event_description: string | null;
  event_datetime: string; // ISO
};

type AttendedCardProps = {
  id: number;
  name: string;
  description?: string | null;
  points?: number | null;
  eventDate?: string; // ISO
  attendedAt?: string; // ISO
};

const Events = () => {
  const [attendedEvents, setAttendedEvents] = useState<AttendedCardProps[]>([]);
  const [eventCode, setEventCode] = useState("");

  // fetch attended, map to AttendedCard shape
  const fetchAttended = async () => {
    try {
      const { data, error } = await supabase.rpc("get_my_attendance");
      if (error) throw error;

      const rows = (data ?? []) as AttendedRow[];

      const mapped: AttendedCardProps[] = rows.map((r) => ({
        id: r.attendance_id,
        name: r.event_name,
        description: r.event_description,
        points: r.points ?? 0,
        eventDate: r.event_datetime, // 🆕
        attendedAt: r.attended_at, // 🆕
      }));

      setAttendedEvents(mapped);
    } catch (err) {
      console.error("[fetchAttended] RPC error:", err);
      setAttendedEvents([]);
    }
  };

  //load attended on mount
  useEffect(() => {
    fetchAttended();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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

    switch (data) {
      case "already_registered":
        toast("Already registered for this event!");
        break;
      case "event_not_started":
        toast.error("The event hasn't begun yet");
        break;
      case "event_expired":
        toast.error("The event has passed");
        break;
      case "not_authenticated":
        toast.error("Please log in first.");
        break;
      case "member_not_found":
        toast.error("Your account is not linked to a member profile.");
        break;
      case "invalid_event":
        toast.error("Invalid event code.");
        break;
      case "registered":
        toast.success("Event registration successful!");
        setEventCode("");
        // ✅ refresh attended list after successful registration
        fetchAttended();
        break;
      default:
        toast.error("Unexpected server response.");
    }
  };

  return (
    <Section className="flex flex-col lg:flex-row items-stretch justify-center pt-0">
      <div className="flex-5 flex flex-col bg-base-300 p-8 rounded-2xl">
        <h2 className="text-4xl font-bold">Attended Events</h2>
        <a
          onClick={() => {}}
          className="text-blue-400 underline cursor-pointer flex items-center text-lg py-2"
        >
          Find Upcoming Events <MdOpenInNew />
        </a>

        <div className="flex size-full justify-center items-start gap-8">
          <div className="w-full flex flex-col gap-5 mt-10 max-w-[800px]">
            {attendedEvents.length === 0 ? (
              <span className="text-2xl opacity-70">You haven't attended any events yet</span>
            ) : (
              attendedEvents.map((ev) => <AttendedCard key={ev.id} {...ev} />)
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col bg-base-300 rounded-2xl p-8 gap-6 items-center">
          <h2 className="text-4xl font-bold">Event Check In</h2>
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
            <label className="input input-primary input-lg flex items-center justify-end">
              <input
                type="text"
                required
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                placeholder="Enter event code"
              />
              <button className="btn btn-primary btn-sm text-base" type="submit">
                <FaArrowRight />
              </button>
            </label>
          </form>
        </div>

        <div className="flex flex-col justify-between bg-base-300 p-8 rounded-2xl gap-6">
          <h2 className="text-4xl font-bold text-center">Event Stats</h2>
          <div className="grid grid-cols-2 grid-rows-3 gap-6">
            <span className="text-5xl text-center text-primary font-bold">?</span>
            <span className="text-xl text-center w-10">Events Attended</span>
            <span className="text-5xl text-center text-primary font-bold">?</span>
            <span className="text-xl text-center w-10">Points Attainable</span>
            <span className="text-5xl text-center text-primary font-bold">?</span>
            <span className="text-xl text-center w-10">Experience Attainable</span>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Events;
