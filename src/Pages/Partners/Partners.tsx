import faq from "../../Assets/Data/FAQ.json";
import OurPartners from "../../Components/OurPartners";
import WorkWithUs from "./WorkWithUs";
import ContactUs from "../../Components/ContactUs";
import FAQ from "../../Components/FAQ";
import Page from "../Page/Page";

const Partners = () => {
  return (
    <Page>
      <OurPartners />
      <WorkWithUs />
      <ContactUs />
      <FAQ faq={faq.partners} />
    </Page>
  );
};

export default Partners;
