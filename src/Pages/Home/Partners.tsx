import partners from "../../Assets/Data/partners.json";
import SafeLink from "../../Components/SafeLink";
import Section from "../../Components/Section";
import { useTheme } from "../../Hooks/useTheme";

const Partners = () => {
  const { isDark } = useTheme();
  const logos = isDark ? partners.dark : partners.light;

  return (
    <Section title="Our Partners" className="gap-4">
      <p className="text-lg max-w-xl font-albert-sans text-center">
        {"Interested in hearing how we can help you? Contact us at "}
        <SafeLink href="mailto:ds3@ucsd.edu" className="underline">
          ds3@ucsd.edu
        </SafeLink>
        {" or view our sponsor package "}
        {/* TODO: add link to sponsor package */}
        <SafeLink href="" className="underline">
          here
        </SafeLink>
        .
      </p>

      <div className="flex flex-wrap justify-center mt-20 gap-[clamp(1rem,5vw,5rem)] sm:w-[80%]">
        {Object.entries(logos).map(([name, path], index) => (
          <div
            key={index}
            className="flex items-center justify-center max-w-[clamp(150px,20vw,500px)] h-[clamp(50px,5vw,200px)]"
          >
            <img src={path} alt={name} className="w-full h-full object-contain" />
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Partners;
