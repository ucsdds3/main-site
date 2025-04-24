import { useRef } from "react";
import { TeamType } from "../../Utils/types";
import About from "../../Components/About";
import Page from "../Page/Page";
import Landing from "./Landing";
import Events from "./Events";

const EventPage = ({ events: team }: { events: TeamType }) => {
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
        <Events />
      </div>
    </Page>
  );
};

export default EventPage;
