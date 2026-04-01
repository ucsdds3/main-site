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
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-[clamp(3rem,5vw,5rem)] px-[clamp(1.25rem,4vw,3rem)] py-[clamp(2.5rem,5vw,5rem)]">
        <Suspense>
          <About {...opensourceData.about} />

          <div className="h-px bg-(--obs-border)" />

          <OpenSourceProjects />
        </Suspense>
      </div>
    </Page>
  );
};

export default OpenSource;
