import { motion } from "framer-motion";
import Section from "src/Shared/Page/Section";

const Landing = () => {
  return (
    <Section className="max-w-none! flex w-full flex-col! justify-end! p-0! px-0! py-0!">
      <div className="mx-auto w-full max-w-[1300px] border-b border-(--obs-border) px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(1.5rem,2.5vw,2.5rem)] pt-[clamp(4rem,7vw,7rem)]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-[1.1rem] flex items-center gap-[0.6rem]"
        >
          <div className="obs-accent-bar-orange shrink-0" />
          <span className="text-eyebrow text-eyebrow-orange">Applied AI & data science</span>
        </motion.div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-fluid-hero m-0 text-(--obs-text-primary) tracking-tight"
          >
            Consulting
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="m-0 max-w-[560px] text-right text-[clamp(1rem,1.45vw,1.35rem)] leading-[1.6] text-(--obs-text-primary) opacity-[0.55]"
          >
            Empowering your organization through applied data science.
          </motion.p>
        </div>
      </div>
    </Section>
  );
};

export default Landing;
