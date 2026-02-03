import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";

import Section from "src/Shared/Page/Section";
import AttendedCard from "../Components/AttendedCard";
import { useStats } from "../Hooks/useStats";

const Events = () => {
  const [eventCode, setEventCode] = useState("");
  const { attendedEvents, handleSubmitCode, eventStats } = useStats();

  return (
    <Section className="flex flex-col lg:flex-row items-stretch justify-center pt-0">
      <div className="flex-5 flex flex-col bg-base-300 p-8 rounded-2xl">
        <h2 className="text-4xl font-bold">Attended Events</h2>

        <div className="flex size-full justify-center items-start gap-8">
          <div className="w-full flex flex-col gap-5 mt-10">
            {attendedEvents.length === 0 ? (
              <span className="text-2xl opacity-70">You haven't attended any events yet</span>
            ) : (
              attendedEvents.map((event, idx) => <AttendedCard key={idx} {...event} />)
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col bg-base-300 rounded-2xl p-8 gap-6 items-center">
          <h2 className="text-4xl font-bold">Event Check In</h2>
          <form
            onSubmit={e => handleSubmitCode(e, eventCode)}
            className="flex flex-col items-center gap-4 w-full"
          >
            <label className="input input-primary input-lg flex items-center justify-end">
              <input
                type="text"
                required
                value={eventCode}
                onChange={e => setEventCode(e.target.value)}
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
          <div className="flex flex-col gap-6">
            {Object.entries(eventStats).map(([label, value]) => (
              <div key={label} className="flex justify-around">
                <span className="text-5xl text-center text-primary font-bold">{value}</span>
                <span className="text-lg text-center w-24">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Events;
