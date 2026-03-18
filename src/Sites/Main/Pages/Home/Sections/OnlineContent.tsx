import { motion } from "framer-motion";
import Button from "src/Shared/Components/Button";
import Section from "src/Shared/Page/Section";

import BrowserCard from "../Components/BrowserCard";
import onlineContent from "../Data/onlineContent.json";

const OnlineContent = () => {
  // Show only first 4 articles in a 2-col grid — more breathing room per card
  const featured = onlineContent.slice(0, 4);

  return (
    <Section title="Online Content" className="gap-0">
      {/* Sub-label */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}
      >
        <div style={{ width: 28, height: 2, background: "#19B5CA", borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#19B5CA" }}>
          Latest Work
        </span>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: "'Albert Sans', sans-serif",
          fontSize: "clamp(1.05rem, 1.3vw, 1.15rem)",
          lineHeight: 1.8,
          color: "var(--obs-text-muted)",
          fontWeight: 300,
          maxWidth: 520,
          textAlign: "center",
          marginBottom: "3rem",
        }}
      >
        Read our latest articles and check out our newest podcast episodes to keep up with evolving field of data science!
      </motion.p>

      {/* 2-col card grid */}
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
          gap: "clamp(1.25rem, 2.5vw, 2rem)",
          marginBottom: "3rem",
        }}
      >
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

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}
      >
        {[
          { label: "View Articles →", url: "https://medium.com/ds3ucsd", accent: "rgba(25,181,202," },
          { label: "View Podcasts →", url: "https://www.youtube.com/@ds3atucsd", accent: "rgba(245,129,52," },
        ].map(({ label, url, accent }) => (
          <button
            key={label}
            onClick={() => window.open(url, "_blank")}
            style={{
              padding: "0.85rem 2.5rem",
              borderRadius: "9999px",
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.78rem",
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--obs-text-primary)",
              background: "var(--obs-surface)",
              border: `1px solid ${accent}0.35)`,
              backdropFilter: "blur(8px)",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = `${accent}0.1)`;
              el.style.borderColor = `${accent}0.65)`;
              el.style.color = "var(--obs-text-primary)";
              el.style.transform = "translateY(-2px)";
              el.style.boxShadow = `0 12px 36px ${accent}0.15)`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "var(--obs-surface)";
              el.style.borderColor = `${accent}0.35)`;
              el.style.color = "var(--obs-text-primary)";
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
            }}
          >
            {label}
          </button>
        ))}
      </motion.div>
    </Section>
  );
};

export default OnlineContent;