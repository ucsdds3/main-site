import { lazy, Suspense } from "react";
import Page from "src/Shared/Page/Page.tsx";
import Landing from "./Sections/Landing.tsx";
import consultingData from "./Data/consulting.json";

const About = lazy(() => import("../../Components/About.tsx"));
const Services = lazy(() => import("./Sections/Services.tsx"));
const ConsultingProjects = lazy(() => import("./Sections/ConsultingProjects.tsx"));
const Clients = lazy(() => import("./Sections/Clients.tsx"));

const Divider = () => <div className="h-px bg-(--obs-border)" />;

const Consulting = () => {
  return (
    <Page>
      <Landing />
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-[clamp(3rem,5vw,5rem)] px-[clamp(1.25rem,4vw,3rem)] py-[clamp(2.5rem,5vw,5rem)]">
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
