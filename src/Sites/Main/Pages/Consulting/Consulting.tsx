import { lazy, Suspense, useRef } from "react";
import Page from "src/Shared/Page/Page.tsx";
import Landing from "./Sections/Landing.tsx";
import consultingData from "./Data/consulting.json";

const About = lazy(() => import("../../Components/About.tsx"));
const Services = lazy(() => import("./Sections/Services.tsx"));
const ConsultingProjects = lazy(() => import("./Sections/ConsultingProjects.tsx"));
const Clients = lazy(() => import("./Sections/Clients.tsx"));

const Divider = () => (
  <div style={{ height: 1, background: "var(--obs-border, rgba(128,128,128,0.15))" }} />
);

const Consulting = () => {
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
        <Services />
          <Divider />
          <About {...consultingData.about} />
          <Divider />
          <ConsultingProjects />
          <Divider />
          <Clients />
        </Suspense>
      </div>
    </Page>
  );
};

export default Consulting;