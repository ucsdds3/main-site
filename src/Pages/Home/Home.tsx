import { lazy, Suspense, useRef } from "react";
import Page from "../Page/Page";
import Landing from "./Landing";

const AboutUs = lazy(() => import("./AboutUs"));
const GetInvolved = lazy(() => import("./GetInvolved/GetInvolved"));
const WhereWeBeen = lazy(() => import("./WhereWeBeen/WhereWeBeen"));
const OurPartners = lazy(() => import("../../Components/OurPartners"));

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
          <OurPartners />
        </Suspense>
      </div>
    </Page>
  );
};

export default Home;
