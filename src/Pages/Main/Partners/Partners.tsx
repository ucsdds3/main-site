import { lazy, Suspense } from "react";
import OurPartners from "src/Pages/Main/Components/OurPartners";
import Page from "src/Components/Page/Page";

const WorkWithUs = lazy(() => import("./WorkWithUs"));
const ContactUs = lazy(() => import("src/Components/Sections/ContactUs"));

const Partners = () => {
  return (
    <Page>
      <WorkWithUs />
      <OurPartners />
      <Suspense>
        <ContactUs type="partners" />
      </Suspense>
    </Page>
  );
};

export default Partners;
