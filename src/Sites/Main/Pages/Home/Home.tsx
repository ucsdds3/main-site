import { lazy, Suspense } from "react";
import Page from "src/Shared/Page/Page";

import Landing from "./Sections/Landing";
import OnlineContent from "./Sections/OnlineContent";
import faq from "./Data/FAQ.json";
import FAQ from "./Sections/FAQ";

const OurPartners = lazy(() => import("../../Components/OurPartners"));
const AboutUs = lazy(() => import("./Sections/AboutUs"));
const GetInvolved = lazy(() => import("./Sections/GetInvolved"));
const WhereWeBeen = lazy(() => import("./Sections/WhereWeBeen"));

const Home = () => {
  return (
    <Page>
      <Landing />
      <div className="flex w-full min-w-0 flex-col items-center">
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
