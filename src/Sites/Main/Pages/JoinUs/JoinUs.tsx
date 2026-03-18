import { lazy, useRef } from "react";
import Page from "src/Shared/Page/Page";

import Landing from "./Sections/Landing";

const ContactUs = lazy(() => import("src/Shared/Sections/ContactUs"));

const JoinUs = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <ContactUs type="students" />
      </div>
    </Page>
  );
};

export default JoinUs;
