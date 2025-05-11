import Error from "../../Components/Error";
import BrowserCard from "../../Components/BrowserCard";
import { newArray } from "../../Utils/functions.tsx";
import Section from "../../Components/Section";
import { useCalendarEvents } from "../../Hooks/useCalendarEvents";
import { EventType } from "../../Utils/types";

// TODO: Add filtering
const Events = () => {
  const { events, loading, error } = useCalendarEvents();

  return (
    <Section className="py-20 w-[80vw] max-w-[1204px]">
      {error ? (
        <Error message={error!} />
      ) : events.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fit,clamp(350px,60vw,450px))] lg:grid-cols-[repeat(auto-fit,clamp(350px,40vw,360px))] justify-center lg:justify-start w-full lg:gap-5 ">
          {loading
            ? newArray(3).map((_, index) => (
                <BrowserCard key={index} {...({} as EventType)} delay={0} />
              ))
            : events.map((event, index) => <BrowserCard key={index} {...event} delay={0} />)}
        </div>
      ) : (
        <span className="text-[clamp(20px,2vw,40px)] text-balance text-center">
          No upcoming Events at this point in time, check our social media for the most up-to-date
          news!!
        </span>
      )}
    </Section>
  );
};

export default Events;
