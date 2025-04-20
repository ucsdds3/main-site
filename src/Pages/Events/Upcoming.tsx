import Error from "../../Components/Error";
import Page from "../../Components/Page/Page";
import Section from "../../Components/Section";
import { useCalendarEvents } from "../../Hooks/useCalendarEvents";
import { newArray } from "../../Utils/functions";
import { EventType } from "../../Utils/types";
import BrowserCard from "../../Components/BrowserCard";
import Landing from "./Landing";
import { useRef } from "react";

const Upcoming = () => {
  const { events, loading, error } = useCalendarEvents();
  const nextRef = useRef<HTMLDivElement>(null!);

  return (
    <Page>
      <Landing title="UPCOMING EVENTS" subtitle="Want to see what's next?" nextRef={nextRef} />
      <Section ref={nextRef}>
        {error ? (
          <Error message={error!} />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,clamp(350px,60vw,450px))] lg:grid-cols-[repeat(auto-fit,clamp(350px,40vw,400px))] justify-center lg:justify-start w-full lg:gap-5 ">
            {loading
              ? newArray(3).map((_, index) => <BrowserCard key={index} {...({} as EventType)} />)
              : events.map((event, index) => <BrowserCard key={index} {...event} />)}
          </div>
        )}
      </Section>
    </Page>
  );
};

export default Upcoming;
