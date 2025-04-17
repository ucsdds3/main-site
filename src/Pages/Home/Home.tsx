import { useRef } from "react";
import Page from "../../Components/Page/Page"
import Landing from "./Landing/Landing";

const Home = () => {
  const AboutUsRef = useRef<HTMLDivElement>(null!);

  return (
    <Page>
      <Landing nextSectionRef={AboutUsRef}/>
    </Page>
  )
}

export default Home
