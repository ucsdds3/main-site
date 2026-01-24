import { lazy, Suspense } from "react";
import Page from "src/Shared/Page/Page";
import OurPartners from "../../Components/OurPartners";

const WorkWithUs = lazy(() => import("./WorkWithUs"));
const ContactUs = lazy(() => import("src/Shared/Sections/ContactUs"));

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
