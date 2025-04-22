import { useRef } from "react";
import Page from "../Page/Page";
import Landing from "./Landing";
import AboutUs from "./AboutUs";
import GetInvolved from "./GetInvolved/GetInvolved";
import WhereWeBeen from "./WhereWeBeen/WhereWeBeen";
import OurPartners from "../../Components/OurPartners";

const Home = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <AboutUs />
        <GetInvolved />
        <WhereWeBeen />
        <OurPartners />
      </div>
    </Page>
  );
};

export default Home;
