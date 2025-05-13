import { motion } from "framer-motion";
import Section from "../../Components/Section";
import data from "../../Assets/Data/aboutUs.json";
import { Link } from "react-router";
import useImagePreloader from "../../Hooks/useImagepreload";

const AboutUs = () => {
  const ImagePreloader = useImagePreloader(data.map((daton) => daton.image));
  return (
    <Section title="About Us">
      <div className="mt-10 flex flex-col gap-25">
        {data.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className={`flex flex-col-reverse gap-6 lg:gap-[6vw] w-full ${
              index % 2 === 0 ? "lg:flex-row-reverse" : "lg:flex-row"
            }`}
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
                className="w-[14rem] sm:min-w-1/3 text-center rounded-full bg-base-300 border-1 hover:border-(--color-primary) duration-300 py-[clamp(1rem,1.4vw,1.4rem)] text-[clamp(1.2rem,1.2vw,2rem)]"
              >
                {section.button}
              </Link>
            </div>

            <div className="flex-1 flex items-center">
              <div className="aspect-video w-full rounded-lg overflow-hidden ">
                {ImagePreloader.imagesPreloaded ? (
                  <img
                    className="w-full h-full object-cover"
                    src={section.image}
                    alt={section.section}
                  />
                ) : (
                  <div className="skeleton min-w-[410px] h-full"></div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default AboutUs;
