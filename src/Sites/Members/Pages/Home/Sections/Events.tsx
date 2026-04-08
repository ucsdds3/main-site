import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";

import Section from "src/Shared/Page/Section";
import EventCard from "src/Shared/Events/EventCard";
import { Input } from "src/Sites/Members/Components/Input";
import { useEvents } from "../Hooks/useEvents";
import { useScreenSize } from "src/Hooks/useScreenSize";

const Events = () => {
  const [eventCode, setEventCode] = useState("");
  const { attendedEvents, handleSubmitCode, eventStats } = useEvents();
  const { width } = useScreenSize();

  return (
    <Section className="flex flex-col-reverse items-stretch justify-center pt-0 lg:flex-row">
      <div className="flex-4 obs-panel flex flex-col p-8">
        <h2 className="text-fluid-subsection-title">Recently Attended Events</h2>

        <div className="flex size-full items-start justify-center gap-8">
          <div className="mt-10 grid w-full grid-cols-[repeat(auto-fit,clamp(100px,80vw,300px))] items-center justify-around gap-5 xl:grid-cols-[repeat(auto-fit,clamp(200px,35vw,325px))]">
            {attendedEvents.length === 0 ? (
              <span className="fl-text-lg/xl text-(--obs-text-muted)">
                You haven&apos;t attended any events yet
              </span>
            ) : (
              attendedEvents
                .slice(0, width <= 1792 ? 2 : 3)
                .map((event, idx) => <EventCard key={idx} event={event} delay={0.2 * idx} />)
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="obs-panel flex flex-col items-center gap-6 p-8">
          <h2 className="text-fluid-subsection-title text-center">Event Check In</h2>
          <form
            onSubmit={e => handleSubmitCode(e, eventCode)}
            className="flex w-full flex-col items-center gap-4"
          >
            <Input
              label="Event code"
              fieldId="member-event-code"
              hideLabel
              required
              type="text"
              placeholder="Enter event code"
              value={eventCode}
              setValue={setEventCode}
              className="w-full max-w-md min-w-0"
              inputRowClassName="min-h-11 gap-2 py-1 pl-4 pr-1"
              endAdornment={
                <button
                  className="btn btn-primary btn-sm shrink-0 rounded-lg text-base"
                  type="submit"
                >
                  <FaArrowRight />
                </button>
              }
            />
          </form>
        </div>

        <div className="obs-panel flex flex-col justify-between gap-6 p-8">
          <h2 className="text-fluid-subsection-title text-center">Event Stats</h2>
          <div className="flex flex-col items-center gap-6">
            {Object.entries(eventStats).map(([label, value]) => (
              <div key={label} className="flex w-[clamp(200px,25vw,250px)] justify-around">
                <span className="text-center text-5xl font-bold text-[#19B5CA]">{value}</span>
                <span className="w-24 text-center text-lg text-(--obs-text-muted)">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Events;
