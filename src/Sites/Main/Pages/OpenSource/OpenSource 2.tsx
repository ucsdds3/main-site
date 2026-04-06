import { lazy, Suspense } from "react";

import Page from "src/Shared/Page/Page.tsx";

import Landing from "./Sections/Landing.tsx";
import opensourceData from "./Data/opensource.json";

const About = lazy(() => import("../../Components/About.tsx"));
const OpenSourceProjects = lazy(() => import("./Sections/OpenSourceProjects.tsx"));

const OpenSource = () => {
  return (
    <Page>
      <Landing />
      <div
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
          <About {...opensourceData.about} />

          <div style={{ height: 1, background: "var(--obs-border, rgba(128,128,128,0.15))" }} />

          <OpenSourceProjects />
        </Suspense>
      </div>
    </Page>
  );
};

export default OpenSource;