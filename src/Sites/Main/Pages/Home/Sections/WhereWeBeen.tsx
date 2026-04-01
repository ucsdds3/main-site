import { motion } from "framer-motion";
import Section from "src/Shared/Page/Section";

import Carousel from "../Components/Carousel";
import SlideshowCarousel from "../Components/SlideshowCarousel";
import cardData from "../Data/testimonials.json";

const WhereWeBeen = () => {
  return (
    <Section title="Where We Are" className="gap-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 flex items-center gap-3"
      >
        <div className="h-0.5 w-7 shrink-0 rounded-sm bg-[#F58134]" />
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#F58134]">
          Students from our community
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        <SlideshowCarousel images={cardData} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full"
      >
        <Carousel />
      </motion.div>
    </Section>
  );
};

export default WhereWeBeen;
