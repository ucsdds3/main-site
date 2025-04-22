import Section from "../../Components/Section";
import data from "../../Assets/Data/aboutUs.json";
import { Link } from "react-router";

const AboutUs = () => {
  return (
    <Section title="About Us">
      <div className="mt-10 flex flex-col gap-10">
        {data.map((section, index) => (
          <div
            className={`flex flex-col gap-6 lg:gap-[7vw] w-full ${
              index % 2 === 0 ? "lg:flex-row-reverse" : "lg:flex-row"
            }`}
            key={index}
          >
            <div className="flex-1 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-[clamp(1.2rem,2vw,2rem)] brightness-75">{section.section}</h3>
                <h2 className="text-[clamp(2rem,3vw,2.3rem)] leading-tight">{section.title}</h2>
                <p className="text-[clamp(1.2rem,1.5vw,2rem)] mt-2 brightness-75">
                  {section.content}
                </p>
              </div>
              <Link
                to={section.link}
                className="w-1/2 sm:min-w-1/3 text-center rounded-full bg-base-300 border-2 hover:border-(--color-primary) duration-300 py-[clamp(1rem,1.4vw,1.4rem)] text-[clamp(1.2rem,1.2vw,2rem)]"
              >
                {section.button}
              </Link>
            </div>

            <div className="flex-1 flex items-center">
              <div className="aspect-video w-full rounded-lg overflow-hidden border-2">
                <img
                  className="w-full h-full object-cover"
                  src={section.image}
                  alt={section.section}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default AboutUs;
