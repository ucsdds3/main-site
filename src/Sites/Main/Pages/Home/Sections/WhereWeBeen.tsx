import { motion } from "framer-motion";
import Section from "src/Shared/Page/Section";

import Carousel from "../Components/Carousel";
import SlideshowCarousel from "../Components/SlideshowCarousel";
import cardData from "../Data/testimonials.json";

const WhereWeBeen = () => {
  return (
    <Section title="Where We Are" className="gap-8">
      {/* ── Sub-label ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "3rem",
        }}
      >
        <div
          style={{
            width: 28, height: 2,
            background: "#F58134",
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#F58134",
          }}
        >
          Students from our community
        </span>
      </motion.div>

      {/* ── Testimonials slideshow ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%" }}
      >
        <SlideshowCarousel images={cardData} />
      </motion.div>

      {/* ── Partner logo carousel ── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ width: "100%" }}
      >
        <Carousel />
      </motion.div>
    </Section>
  );
};

export default WhereWeBeen;