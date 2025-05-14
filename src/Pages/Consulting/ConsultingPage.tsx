import { useRef } from "react";
import Page from "../Page/Page";
import Landing from "./Landing";
import ContactUs from "../../Components/ContactUs";
import AboutUs from "./AboutUs";
import OurWork from "./OurWork";

const ConsultingPage = () => {
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

export default ConsultingPage;
