import { useRef } from "react";
import { newArray } from "../../Utils/functions";
import { EventType, TeamType } from "../../Utils/types";
import { useCalendarEvents } from "../../Hooks/useCalendarEvents";
import BrowserCard from "../../Components/BrowserCard";
import AboutTeam from "../../Components/AboutTeam";
import Section from "../../Components/Section";
import Page from "../../Components/Page/Page";
import Error from "../../Components/Error";
import Landing from "./Landing";

// TODO: Add filtering
const EventPage = ({ events: team }: { events: TeamType }) => {
  const { events, loading, error } = useCalendarEvents();
  const nextRef = useRef<HTMLDivElement>(null!);

  return (
    <Page>
      <Landing title={team.title.toUpperCase()} subtitle={team.subtitle} nextRef={nextRef} />
      <AboutTeam {...team} ref={team.name ? nextRef : null} />
      <Section className="py-20 w-[80vw] max-w-[1204px]" ref={team.name ? null : nextRef}>
        {error ? (
          <Error message={error!} />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,clamp(350px,60vw,450px))] lg:grid-cols-[repeat(auto-fit,clamp(350px,40vw,380px))] justify-center lg:justify-start w-full lg:gap-5 ">
            {loading
              ? newArray(3).map((_, index) => <BrowserCard key={index} {...({} as EventType)} />)
              : events.map((event, index) => <BrowserCard key={index} {...event} />)}
          </div>
        )}
      </Section>
    </Page>
  );
};

export default EventPage;
