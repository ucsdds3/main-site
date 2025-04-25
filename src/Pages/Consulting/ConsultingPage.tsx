import { useRef } from "react";
import Page from "../Page/Page"
import Landing from "./Landing";
import ContactUs from "../../Components/ContactUs";

const ConsultingPage = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);
  const contactRef = useRef<HTMLDivElement>(null!);

  return (
    <Page scrollRef={scrollRef}>
      <Landing contactRef={contactRef} />
      <div ref={scrollRef}>
        <ContactUs ref={contactRef} />
      </div>
    </Page>
  )
}

export default ConsultingPage
