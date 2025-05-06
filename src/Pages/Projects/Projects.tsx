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

import { newArray } from "../../Utils/functions.tsx";

const Projects = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);
  const ProjectsGallery = [
    "/main-site/Projects/P1.jpeg",
    "/main-site/Projects/P2.jpg",
    "/main-site/Projects/P3.jpg",
    "/main-site/Projects/P4.jpg",
    "/main-site/Projects/P5.jpg",
    "/main-site/Projects/P6.jpg",
    "/main-site/Projects/P7.jpg"
  ]
  

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <Suspense>
          <About {...projects.about} />
          <ShowCase />
          <Gallery images={projects.images || ProjectsGallery} />
        </Suspense>
      </div>
    </Page>
  );
};

export default Projects;
