import partners from "../Assets/Data/partners.json";
import SafeLink from "../Components/SafeLink";
import Section from "../Components/Section";
import { useTheme } from "../Hooks/useTheme";

const OurPartners = () => {
  const { isDark } = useTheme();
  const logos = isDark ? partners.dark : partners.light;

  return (
    <Section title="Our Partners" className="gap-0">
      <p className="text-2xl font-light max-w-xl text-center px-10">
        {"Interested in hearing how we can help you? Contact us at "}
        <SafeLink href="mailto:ds3@ucsd.edu" className="underline">
          ds3@ucsd.edu
        </SafeLink>
        {" or view our sponsor package "}
        {/* TODO: add link to sponsor package */}
        <SafeLink
          href="https://drive.google.com/file/d/1bMJLw3mid90WxVuFgFaFNUPnX2FJknbW/view?usp=sharing"
          className="underline"
        >
          here
        </SafeLink>
        .
      </p>

      <div className="flex flex-wrap justify-center mt-16 gap-12 sm:w-[90%]">
        {Object.entries(logos).map(([name, path], index) => (
          <div
            key={index}
            className="w-[200px] h-[100px] flex items-center justify-center"
          >
            <img
              src={path}
              alt={name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ))}
      </div>
    </Section>
  );
};

export default OurPartners;
