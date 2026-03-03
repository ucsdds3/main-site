import { lazy, Suspense, useRef } from "react";

import Page from "src/Shared/Page/Page.tsx";

import Landing from "./Sections/Landing.tsx";
import projects from "./Data/projects.json";

const About = lazy(() => import("../../Components/About.tsx"));
// const Gallery = lazy(() => import("../../Components/Gallery.tsx"));
const ShowCase = lazy(() => import("./Sections/ShowCase.tsx"));
const Archive = lazy(() => import("./Sections/Archive.tsx"));

const Projects = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div
        ref={scrollRef}
        style={{
          width: "100%",
          maxWidth: 1300,
          margin: "0 auto",
          padding: "clamp(2.5rem, 5vw, 5rem) clamp(1.25rem, 4vw, 3rem)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(3rem, 5vw, 5rem)",
        }}
      >
        <Suspense>
          <About {...projects.about} />

          <div style={{ height: 1, background: "var(--obs-border, rgba(128,128,128,0.15))", margin: "clamp(1rem, 2vw, 2rem) 0" }} />

          <ShowCase />

          <div style={{ height: 1, background: "var(--obs-border, rgba(128,128,128,0.15))", margin: "clamp(1rem, 2vw, 2rem) 0" }} />

          <Archive />

          <div style={{ height: 1, background: "var(--obs-border, rgba(128,128,128,0.15))", margin: "clamp(1rem, 2vw, 2rem) 0" }} />

          {/* <Gallery images={projects.images} /> */}
        </Suspense>
      </div>
    </Page>
  );
};

export default Projects;