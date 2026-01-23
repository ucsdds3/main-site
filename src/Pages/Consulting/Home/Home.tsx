import { useRef } from "react";
import Page from "src/Components/Page/Page";
import Landing from "./Sections/Landing";
import ContactUs from "src/Components/ContactUs";
import AboutUs from "./Sections/AboutUs";
import OurWork from "./Sections/OurWork";

const Home = () => {
  const contactRef = useRef<HTMLDivElement>(null!);

  return (
    <Page id="home">
      <Landing contactRef={contactRef} />
      <AboutUs />
      <OurWork />
      <ContactUs ref={contactRef} />
    </Page>
  );
};

export default Home;
