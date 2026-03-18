import { lazy, Suspense, useRef } from "react";
import Page from "src/Shared/Page/Page";

import Landing from "./Sections/Landing";
import OnlineContent from "./Sections/OnlineContent";
import faq from "../JoinUs/Data/FAQ.json";
import FAQ from "../JoinUs/Sections/FAQ";

const OurPartners = lazy(() => import("../../Components/OurPartners"));
const AboutUs = lazy(() => import("./Sections/AboutUs"));
const GetInvolved = lazy(() => import("./Sections/GetInvolved"));
const WhereWeBeen = lazy(() => import("./Sections/WhereWeBeen"));

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
          <FAQ faq={faq} />
        </Suspense>
      </div>
    </Page>
  );
};

export default Home;
