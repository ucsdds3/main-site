import { useRef } from "react";
import Page from "../../Components/Page/Page"
import Landing from "./Landing/Landing";
import AboutUs from "./AboutUs";

const Home = () => {
  const AboutUsRef = useRef<HTMLDivElement>(null!);

  return (
    <Page>
      <Landing nextSectionRef={AboutUsRef}/>
      <AboutUs aboutUsRef={AboutUsRef} />
    </Page>
  )
}

export default Home
