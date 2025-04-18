import { useRef } from "react";
import Page from "../../Components/Page/Page"
import Landing from "./Landing/Landing";
import AboutUs from "./AboutUs";
import GetInvolved from "./GetInvolved/GetInvolved";

const Home = () => {
  const AboutUsRef = useRef<HTMLDivElement>(null!);

  return (
    <Page>
      <Landing nextSectionRef={AboutUsRef}/>
      <AboutUs aboutUsRef={AboutUsRef} />
      <GetInvolved />
    </Page>
  )
}

export default Home
