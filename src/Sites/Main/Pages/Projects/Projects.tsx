import { lazy, Suspense, useRef } from "react";

import Page from "src/Shared/Page/Page.tsx";

import Landing from "./Sections/Landing.tsx";
import projects from "./Data/projects.json";

const About = lazy(() => import("../../Components/About.tsx"));
const Gallery = lazy(() => import("../../Components/Gallery.tsx"));
const ShowCase = lazy(() => import("./Sections/ShowCase.tsx"));
const Archive = lazy(() => import("./Sections/Archive.tsx"));

const Projects = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <Suspense>
          <About {...projects.about} />
          <ShowCase />
          <Archive />
          <Gallery images={projects.images} />
        </Suspense>
      </div>
    </Page>
  );
};

export default Projects;
