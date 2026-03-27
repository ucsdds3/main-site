import { motion } from "framer-motion";
import Section from "src/Shared/Page/Section";

import Stats from "../Components/Stats";
import BrowserCard from "../Components/BrowserCard";
import cardData from "../Data/getInvolved.json";

const GetInvolved = () => {
  return (
    <Section title="Get Involved" id="get-involved" className="gap-16">
      {/* ── Section intro label ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginTop: "-0.5rem",
        }}
      >
        <div style={{
          width: 28, height: 2,
          background: "#19B5CA",
          borderRadius: 2,
          boxShadow: "0 0 8px rgba(25,181,202,0.7)",
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: "0.78rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#19B5CA",
        }}>
          Join the community
        </span>
      </motion.div>

      {/* ── Stats panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex justify-center"
      >
        <Stats />
      </motion.div>

      {/* ── Cards grid ── */}
      <div className="w-full grid grid-cols-[repeat(auto-fit,clamp(300px,80vw,600px))] xl:grid-cols-[repeat(auto-fit,clamp(400px,37vw,700px))] justify-center items-stretch gap-8 2xl:gap-x-16">
        {cardData.map((card, index) => (
          <BrowserCard
            key={index}
            {...card}
            delay={index * 0.12}
          />
        ))}
      </div>
    </Section>
  );
};

export default GetInvolved;