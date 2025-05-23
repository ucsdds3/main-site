import { lazy, Suspense } from "react";
import OurPartners from "../../Components/OurPartners";
const WorkWithUs = lazy(() => {
  return import("./WorkWithUs");
});
const ContactUs = lazy(() => {
  return import("../../Components/ContactUs");
});
// import faq from "../../Assets/Data/FAQ.json";
// const FAQ = lazy(() => {
//   return import("../../Components/FAQ");
// });
import Page from "../Page/Page";

const Partners = () => {
  return (
    <Page>
      <OurPartners />
      <Suspense>
        <WorkWithUs />
        <ContactUs type="partners" />
        {/* <FAQ faq={faq.partners} /> */}
      </Suspense>
    </Page>
  );
};

export default Partners;
