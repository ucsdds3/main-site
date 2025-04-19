import { useRef } from "react";
import Page from "../../Components/Page/Page"
import Landing from "./Landing/Landing";
import AboutUs from "./AboutUs";
import GetInvolved from "./GetInvolved/GetInvolved";
import WhereWeBeen from "./WhereWeBeen/WhereWeBeen";

const Home = () => {
  const AboutUsRef = useRef<HTMLDivElement>(null!);

  return (
    <Page>
      <Landing nextSectionRef={AboutUsRef}/>
      <AboutUs aboutUsRef={AboutUsRef} />
      <GetInvolved />
      <WhereWeBeen />
    </Page>
  )
}

export default Home
