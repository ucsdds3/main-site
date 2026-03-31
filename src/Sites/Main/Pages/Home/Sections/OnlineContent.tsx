import { motion } from "framer-motion";
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
        <span className="text-eyebrow text-eyebrow-cyan">Latest Work</span>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="font-body font-light fl-text-base/lg leading-[1.8] text-[var(--obs-text-muted)] max-w-[520px] text-center mb-12"
      >
        Read our latest articles and check out our newest podcast episodes to keep up with evolving field of data science!
      </motion.p>

      {/* 2-col card grid */}
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
          gap: "var(--tw-gap, 1.5rem)",
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
            className="font-mono rounded-full px-10 py-[0.85rem] text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[var(--obs-text-primary)] backdrop-blur-sm transition-all duration-[250ms] cursor-pointer"
            style={{
              background: "var(--obs-surface)",
              border: `1px solid ${accent}0.35)`,
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