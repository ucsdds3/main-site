import { useRef } from "react";
import { cardData, TeamType } from "../../Utils/types";
import About from "../../Components/About";
import Page from "../Page/Page";
import Landing from "./Landing";
import Events from "./Events";
import EventsShowCase from "./EventsShowcase";
const EventPage = ({ events: team, images }: { events: TeamType; images?: cardData[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null!);

  if (!team.title || !team.subtitle) {
    console.error("Missing team title or subtitle");
    return null;
  }

  return (
    <Page scrollRef={scrollRef}>
      <Landing title={team.title.toUpperCase()} subtitle={team.subtitle} />
      <div className="flex flex-col items-center" ref={scrollRef}>
        <About {...team} />
        <EventsShowCase />
        <Events />
      </div>
    </Page>
  );
};

export default EventPage;
