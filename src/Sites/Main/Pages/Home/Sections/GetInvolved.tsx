import { motion } from "framer-motion";
import Section from "src/Shared/Page/Section";

import Stats from "../Components/Stats";
import BrowserCard from "../Components/BrowserCard";
import cardData from "../Data/getInvolved.json";

const GetInvolved = () => {
  return (
    <Section title="Get Involved" id="get-involved" className="gap-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="-mt-2 flex items-center gap-3"
      >
        <div className="h-0.5 w-7 shrink-0 rounded-sm bg-[#19B5CA] shadow-[0_0_8px_rgba(25,181,202,0.7)]" />
        <span className="font-mono text-[0.78rem] uppercase tracking-[0.22em] text-[#19B5CA]">
          Join the community
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full justify-center"
      >
        <Stats />
      </motion.div>

      <div className="grid w-full grid-cols-[repeat(auto-fit,clamp(300px,80vw,600px))] items-stretch justify-center gap-8 xl:grid-cols-[repeat(auto-fit,clamp(400px,37vw,700px))] 2xl:gap-x-16">
        {cardData.map((card, index) => (
          <BrowserCard key={index} {...card} delay={index * 0.12} />
        ))}
      </div>
    </Section>
  );
};

export default GetInvolved;
