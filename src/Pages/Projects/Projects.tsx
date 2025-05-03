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
  const fakeGallery = newArray(7, "").map(() =>
    Math.random() > 0.5 ? "" : "/main-site/GetInvolved/projects-img.jpeg"
  );

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <Suspense>
          <About {...projects.about} />
          <ShowCase />
          <Gallery images={projects.images || fakeGallery} />
        </Suspense>
      </div>
    </Page>
  );
};

export default Projects;
