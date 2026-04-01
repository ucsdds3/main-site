import { motion } from "framer-motion";
import Section from "src/Shared/Page/Section";

import BrowserCard from "../Components/BrowserCard";
import onlineContent from "../Data/onlineContent.json";
import { IoIosArrowForward } from "react-icons/io";

const OnlineContent = () => {
  const featured = onlineContent.slice(0, 4);

  return (
    <Section title="Online Content" className="gap-0">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-5 flex items-center gap-3"
      >
        <div className="obs-accent-bar-cyan" />
        <span className="text-eyebrow text-eyebrow-cyan">Latest Work</span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 max-w-[520px] text-center font-body font-light fl-text-base/lg leading-[1.8] text-(--obs-text-muted)"
      >
        Read our latest articles and check out our newest podcast episodes to keep up with evolving field of data science!
      </motion.p>

      <div className="mb-12 grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,480px),1fr))] gap-6">
        {featured.map((content, index) => (
          <BrowserCard
            key={content.title}
            image={content.image}
            title={content.title}
            description={content.description}
            link={content.link}
            delay={index * 0.1}
            linkText="View More"
            compact
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap justify-center gap-4"
      >
        <button
          type="button"
          onClick={() => window.open("https://medium.com/ds3ucsd", "_blank")}
          className="obs-online-cta obs-online-cta--cyan"
        >
          <span className="flex items-center gap-1">
            View Articles <IoIosArrowForward />
          </span>
        </button>
        <button
          type="button"
          onClick={() => window.open("https://www.youtube.com/@ds3atucsd", "_blank")}
          className="obs-online-cta obs-online-cta--orange"
        >
          <span className="flex items-center gap-1">
            View Podcasts <IoIosArrowForward />
          </span>
        </button>
      </motion.div>
    </Section>
  );
};

export default OnlineContent;
