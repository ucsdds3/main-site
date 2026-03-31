import { motion } from "framer-motion";
import Section from "src/Shared/Page/Section";

interface LandingProps {
  title: string;
  subtitle: string;
  headerImg?: string;
}

const Landing = ({ title, subtitle }: LandingProps) => {
  return (
    <Section
      style={{
        width: "100%",
        minHeight: "42vh",
        display: "flex",
        alignItems: "flex-end",
        padding: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1300,
          margin: "0 auto",
          padding: "clamp(6rem, 10vw, 10rem) clamp(1.25rem, 4vw, 3rem) clamp(2rem, 3vw, 3rem)",
          borderBottom: "1px solid var(--obs-border, rgba(128,128,128,0.2))",
        }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.1rem" }}
        >
          <div style={{ width: 22, height: 2, background: "#F58134", borderRadius: 2, flexShrink: 0 }} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#F58134",
            }}
          >
            {subtitle}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(3.5rem, 8vw, 7rem)",
            fontWeight: 400,
            lineHeight: 0.95,
            color: "var(--obs-text-primary)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </motion.h1>
      </div>
    </Section>
  );
};

export default Landing;