import { motion } from "framer-motion";
import Section from "src/Shared/Page/Section";

const Landing = () => {
  return (
    <Section className="max-w-none! flex w-full flex-col! justify-end! p-0! px-0! py-0!">
      <div className="mx-auto w-full max-w-[1300px] border-b border-(--obs-border) px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(1.5rem,2.5vw,2.5rem)] pt-[clamp(4rem,7vw,7rem)]">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-[1.1rem] flex items-center gap-[0.6rem]"
        >
          <div className="obs-accent-bar-orange shrink-0" />
          <span className="text-eyebrow text-eyebrow-orange">Want to build your resume?</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-fluid-hero m-0 text-(--obs-text-primary) tracking-tight"
        >
          Projects
        </motion.h1>
      </div>
    </Section>
  );
};

export default Landing;
