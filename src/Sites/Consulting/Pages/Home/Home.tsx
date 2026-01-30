import { useRef } from "react";

import Page from "src/Shared/Page/Page";
import ContactUs from "src/Shared/Sections/ContactUs";

import Landing from "./Sections/Landing";
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
