import { lazy, Suspense } from "react";

import Page from "src/Shared/Page/Page.tsx";

import Landing from "./Sections/Landing.tsx";
import projects from "./Data/projects.json";

const About = lazy(() => import("../../Components/About.tsx"));
const Gallery = lazy(() => import("./Sections/Gallery.tsx"));

const Projects = () => {
  return (
    <Page>
      <Landing />
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-[clamp(3rem,5vw,5rem)] px-[clamp(1.25rem,4vw,3rem)] py-[clamp(2.5rem,5vw,5rem)]">
        <Suspense>
          <About {...projects.about} />

          <div className="my-[clamp(1rem,2vw,2rem)] h-px bg-(--obs-border)" />

          <Gallery />

          {/* <Gallery images={projects.images} /> */}
        </Suspense>
      </div>
    </Page>
  );
};

export default Projects;