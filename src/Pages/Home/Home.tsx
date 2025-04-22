import { useRef } from "react";
import Page from "../Page/Page"
import Landing from "./Landing/Landing";
import AboutUs from "./AboutUs";
import GetInvolved from "./GetInvolved/GetInvolved";
import WhereWeBeen from "./WhereWeBeen/WhereWeBeen";
import OurPartners from "../../Components/OurPartners";

const Home = () => {
  const AboutUsRef = useRef<HTMLDivElement>(null!);

  return (
    <Page>
      <Landing nextRef={AboutUsRef}/>
      <AboutUs aboutUsRef={AboutUsRef} />
      <GetInvolved />
      <WhereWeBeen />
      <OurPartners />
    </Page>
  )
}

export default Home
