import { lazy, Suspense, useRef } from "react";
import Page from "src/Components/Page/Page";
import Landing from "./Sections/Landing";
import OnlineContent from "./Sections/OnlineContent";

const AboutUs = lazy(() => import("./Sections/AboutUs"));
const GetInvolved = lazy(() => import("./Sections/GetInvolved"));
const WhereWeBeen = lazy(() => import("./Sections/WhereWeBeen"));
const OurPartners = lazy(() => import("src/Pages/Main/Components/OurPartners"));

const Home = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <Suspense>
          <AboutUs />
          <GetInvolved />
          <WhereWeBeen />
          <OnlineContent />
          <OurPartners />
        </Suspense>
      </div>
    </Page>
  );
};

export default Home;
