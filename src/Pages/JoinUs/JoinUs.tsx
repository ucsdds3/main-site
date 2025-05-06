import { lazy, useRef } from "react";
import faq from "../../Assets/Data/FAQ.json";

const ContactUs = lazy(() => {
  return import("../../Components/ContactUs");
});
import FAQ from "../../Components/FAQ";
import Page from "../Page/Page";
import Landing from "./Landing";

const JoinUs = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <ContactUs />
        <FAQ faq={faq.joinUs} />
      </div>
    </Page>
  );
};

export default JoinUs;
