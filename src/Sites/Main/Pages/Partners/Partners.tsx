import { lazy, Suspense } from "react";
import Page from "src/Shared/Page/Page";
import OurPartners from "../../Components/OurPartners";
import WorkWithUs from "./WorkWithUs";

const ContactUs = lazy(() => import("src/Sites/Main/Pages/Consulting/Sections/ContactUs"));

const Partners = () => {
  return (
    <Page>
      <WorkWithUs />
      <div className="mx-auto h-px w-[calc(100%-clamp(2.5rem,8vw,6rem))] max-w-[1300px] bg-(--obs-border)" />
      <OurPartners />
      <div className="mx-auto h-px w-[calc(100%-clamp(2.5rem,8vw,6rem))] max-w-[1300px] bg-(--obs-border)" />
      <Suspense>
        <ContactUs type="partners" />
      </Suspense>
    </Page>
  );
};

export default Partners;