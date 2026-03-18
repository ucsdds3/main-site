import { lazy, Suspense, useRef } from "react";

import Page from "src/Shared/Page/Page.tsx";

import Landing from "./Sections/Landing.tsx";

const QuarterlyProjects = lazy(() => import("./Sections/QuarterlyProjects.tsx"));
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
          <QuarterlyProjects />

          <div style={{ height: 1, background: "var(--obs-border, rgba(128,128,128,0.15))", margin: "clamp(1rem, 2vw, 2rem) 0" }} />

          <Archive />

        </Suspense>
      </div>
    </Page>
  );
};

export default Projects;