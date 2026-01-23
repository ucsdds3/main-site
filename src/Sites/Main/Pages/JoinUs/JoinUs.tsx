import { lazy, useRef } from "react";
import Page from "src/Shared/Page/Page";

import faq from "./Data/FAQ.json";
import FAQ from "./Sections/FAQ";
import Landing from "./Sections/Landing";

const ContactUs = lazy(() => import("src/Shared/Sections/ContactUs"));

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
