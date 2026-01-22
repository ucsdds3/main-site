import { useRef } from "react";
import { EventTagType, EventType, TeamType } from "../../../Utils/types";
import About from "../../../Components/About";
import Page from "../../../Components/Page/Page";
import Landing from "./Landing";
import EventsList from "../../../Components/Events/EventsList";
import EventsShowCase from "./EventsShowcase";

type EventPageProps = {
  team: TeamType;
  images?: { image: string; title: string }[];
}

const EventPage = ({ team, images }: EventPageProps) => {
  const scrollRef = useRef<HTMLDivElement>(null!);

  if (!team.title || !team.subtitle) {
    console.error("Missing team title or subtitle");
    return null;
  }

  const teamEventTagMap: Record<string, EventTagType | ""> = {
    "Workshops": "Workshop",
    "Social Events": "Social",
    "Professional Events": "Professional",
    "Upcoming Events": ""
  }

  const tagFilter = (e: EventType): boolean => {
    if (!e.tags || !e.datetime || new Date(e.datetime) <= new Date()) return false;
    return e.tags.includes(teamEventTagMap[team.title as keyof typeof teamEventTagMap]);
  };

  return (
    <Page scrollRef={scrollRef}>
      <Landing title={team.title.toUpperCase()} subtitle={team.subtitle} headerImg={team.headerImg} />
      <div className="flex flex-col items-center w-full" ref={scrollRef}>
        <About {...team} />
        {images && <EventsShowCase images={images} />}
        <EventsList filter={tagFilter} section />
      </div>
    </Page>
  );
};

export default EventPage;
