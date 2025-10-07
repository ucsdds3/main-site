import { MdOpenInNew } from "react-icons/md";
import Section from "../../../Components/Section";
import { useState, useEffect } from "react";
import { supabase } from "../../../Utils/supabase";
import toast from "react-hot-toast";

const Events = () => {
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      console.log("Auth user info:", data?.user);
    };
    checkUser();
  }, []);
  
  const [eventCode, setEventCode] = useState("");

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
      case "event_not_started":
        toast.error("The event hasn't begun yet")
        break;
      case "event_expired":
          toast.error("The event has passed")
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
      case "already_registered":
        toast("Already registered for this event!");
        break;
      case "registered":
        toast.success("Event registration successful!");
        setEventCode(""); // clear the input
        // optionally refresh member stats here (fetch updated points/xp)
        break;
      default:
        toast.error("Unexpected server response.");
    }
  };
  return (
    <Section className="flex-row flex-wrap items-stretch justify-center pt-0">
      <div className="flex-5 flex flex-col bg-base-300 p-8 rounded-2xl">
        <h2 className="text-4xl font-bold">Attended Events</h2>
        <a
          onClick={() => {
            // Handle click event
          }}
          className="text-blue-400 underline cursor-pointer flex items-center text-lg"
        >
          Find Upcoming Events <MdOpenInNew />
        </a>
        <div className="flex size-full justify-center items-center gap-8">
          <span className="text-2xl">You haven't attended any events yet</span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col bg-base-300 rounded-2xl p-8 gap-6 items-center">
          <h2 className="text-4xl font-bold">Event Check In</h2>
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
            <input
              type="text"
              required
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              className="input input-primary input-lg"
              placeholder="Enter event code"
            />

            <button
              type="submit"
              className="hover:bg-accent-content border-2 rounded-full py-3 px-10 whitespace-nowrap cursor-pointer text-[clamp(1rem,1.2vw,2rem)] min-w-[clamp(8rem,12vw,15rem)] bg-[var(--color)] border-[var(--color-primary)] uppercase font-semibold"
            >
              Submit
            </button>
          </form>
        </div>
        

        <div className="flex flex-col justify-between bg-base-300 p-8 rounded-2xl gap-6">
          <h2 className="text-4xl font-bold text-center">Event Stats</h2>
          <div className="grid grid-cols-2 grid-rows-3 gap-6">
            <span className="text-5xl text-center text-primary font-bold">0</span>
            <span className="text-xl text-center w-10">Events Attended</span>
            <span className="text-5xl text-center text-primary font-bold">100</span>
            <span className="text-xl text-center w-10">Points Attainable</span>
            <span className="text-5xl text-center text-primary font-bold">1000</span>
            <span className="text-xl text-center w-10">Experience Attainable</span>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Events;
