import { useRef } from "react";

import Page from "src/Shared/Page/Page";
import Events from "src/Shared/Events/Events";
import { EventTagType, EventType, TeamType } from "src/Utils/types";

import About from "../../Components/About";
import EventsShowCase from "./Sections/EventsShowcase";
import Landing from "./Sections/Landing";

type EventPageProps = {
  team: TeamType;
  images?: { image: string; title: string }[];
};

const EventPage = ({ team, images }: EventPageProps) => {
  const scrollRef = useRef<HTMLDivElement>(null!);

  if (!team.title || !team.subtitle) {
    console.error("Missing team title or subtitle");
    return null;
  }

  const teamEventTagMap: Record<string, EventTagType | ""> = {
    Workshops: "Workshop",
    "Social Events": "Social",
    "Professional Events": "Professional",
  };

  const tagFilter = (e: EventType): boolean => {
    if (!e.tags || !e.start || new Date(e.start) <= new Date()) return false;
    return (
      team.title == "Upcoming Events" ||
      e.tags.includes(teamEventTagMap[team.title as keyof typeof teamEventTagMap])
    );
  };

  return (
    <Page scrollRef={scrollRef}>
      <Landing
        title={team.title.toUpperCase()}
        subtitle={team.subtitle}
        headerImg={team.headerImg}
      />
      <div className="flex flex-col items-center w-full" ref={scrollRef}>
        <About {...team} />
        <Events filter={tagFilter} section ascending />
        {images && <EventsShowCase images={images} />}
      </div>
    </Page>
  );
};

export default EventPage;
