import { lazy, useRef } from "react";
import faq from "./Data/FAQ.json";

import Page from "src/Components/Page/Page";
import FAQ from "./Sections/FAQ";
import Landing from "./Sections/Landing";

const ContactUs = lazy(() => import("src/Components/Sections/ContactUs"));

const JoinUs = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <ContactUs type="students" />
        <FAQ faq={faq} />
      </div>
    </Page>
  );
};

export default JoinUs;
