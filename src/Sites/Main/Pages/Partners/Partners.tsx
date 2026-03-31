import { lazy, Suspense } from "react";
import Page from "src/Shared/Page/Page";
import OurPartners from "../../Components/OurPartners";
import WorkWithUs from "./WorkWithUs";

const ContactUs = lazy(() => import("src/Sites/Main/Pages/Consulting/Sections/ContactUs"));

const Partners = () => {
  return (
    <Page>
      <WorkWithUs />
      <div style={{ height: 1, background: "var(--obs-border, rgba(128,128,128,0.15))", maxWidth: 1300, margin: "0 auto", width: "calc(100% - clamp(2.5rem, 8vw, 6rem))" }} />
      <OurPartners />
      <div style={{ height: 1, background: "var(--obs-border, rgba(128,128,128,0.15))", maxWidth: 1300, margin: "0 auto", width: "calc(100% - clamp(2.5rem, 8vw, 6rem))" }} />
      <Suspense>
        <ContactUs type="partners" />
      </Suspense>
    </Page>
  );
};

export default Partners;