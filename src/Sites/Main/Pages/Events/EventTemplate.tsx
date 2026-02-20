import { useRef } from "react";

import Page from "src/Shared/Page/Page";
import { EventTagType, TeamType } from "src/Utils/types";

import About from "../../Components/About";
import Landing from "./Sections/Landing";
import EventList from "src/Shared/Events/EventList";

export default function EventTemplate({ team }: { team: TeamType }) {
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

  return (
    <Page scrollRef={scrollRef}>
      <Landing
        title={team.title.toUpperCase()}
        subtitle={team.subtitle}
        headerImg={team.headerImg}
      />
      <div className="flex flex-col items-center w-full" ref={scrollRef}>
        <About {...team} />
        {team.title !== "Upcoming Events" && <h2 className="text-4xl font-bold mt-10">
            {`Upcoming ${team.title}`}
          </h2>}
        <EventList tag={teamEventTagMap[team.title as keyof typeof teamEventTagMap] || "All"} />
      </div>
    </Page>
  );
}
