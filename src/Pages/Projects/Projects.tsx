import { lazy, Suspense, useRef } from "react";
import Page from "../Page/Page";
import Landing from "./Landing";
const About = lazy(() => {
  return import("../../Components/About");
});
const ShowCase = lazy(() => {
  return import("./ShowCase.tsx");
});
const Gallery = lazy(() => {
  return import("../../Components/Gallery");
});

import projects from "../../Assets/Data/projects.json";

const Projects = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);
  
  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <Suspense>
          <About {...projects.about} />
          <ShowCase />
          <Gallery images={projects.images} />
        </Suspense>
      </div>
    </Page>
  );
};

export default Projects;
