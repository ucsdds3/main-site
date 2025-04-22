import { useRef } from "react";
import Page from "../Page/Page";
import Landing from "./Landing";
import AboutTeam from "../../Components/AboutTeam";
import projects from "../../Assets/Data/projects.json";

const Projects = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <AboutTeam {...projects.about} />
      </div>
    </Page>
  );
};

export default Projects;
