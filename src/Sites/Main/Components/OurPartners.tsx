import { motion } from "framer-motion";
import SafeLink from "src/Shared/Components/SafeLink";
import Section from "src/Shared/Page/Section";

import partners from "../Data/partners.json";

const DEPARTMENT_KEYS = [
  "SCIDS",
  "Basement",
  "Scripps",
  "COGS",
  "Rady School of Management",
  "CSE",
  "Jacobs School of Engineering",
  "BRAIN"
];

const CLUB_KEYS = [
  "Triton Ball",
  "AISC",
  "AWS Cloud Club",
  "Biomedical Engineering Society (BMES)",
  "CBC",
  "CSSA",
  "DS3",
  "Emblem",
  "GDG",
  "Product Management Club (PMC)",
  "Startup Incubator Club",
  "SUMS",
  "TESC",
  "Triton Quantitative Trading (TQT)",
  "Triton Software Engineering (TSE)"
];

const OurPartners = () => {
  const logos = partners.dark;

  const department = Object.entries(logos).filter(([name]) =>
    DEPARTMENT_KEYS.includes(name)
  );

  const clubs = Object.entries(logos).filter(([name]) =>
    CLUB_KEYS.includes(name)
  );

  const industry = Object.entries(logos).filter(
    ([name]) =>
      !DEPARTMENT_KEYS.includes(name) &&
      !CLUB_KEYS.includes(name)
  );

  const LogoGrid = ({
    entries,
    delay = 0,
    variant = "default",
  }: {
    entries: [string, string][];
    delay?: number;
    variant?: "default" | "club";
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`partner-grid ${variant === "club" ? "club-grid" : ""}`}
    >
      {entries.map(([name, path], index) => (
        <motion.div
          key={name}
          className="partner-logo-cell"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.04 }}
        >
          <img src={path} alt={name} title={name} />
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <Section title="Our Partners" className="gap-0">
      <style>{`
        .partner-logo-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 2rem;
          border-right: 1px solid var(--obs-border);
          border-bottom: 1px solid var(--obs-border);
          transition: background 0.25s ease;
        }
        .partner-logo-cell:hover {
          background: var(--obs-surface);
        }
        .partner-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(clamp(100px, 20vw, 200px), 1fr));
          border-top: 1px solid var(--obs-border);
          border-left: 1px solid var(--obs-border);
          width: 100%;
        }
        .partner-logo-cell img {
          width: 100%;
          height: 80px;
          object-fit: contain;
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }
        
        /* Smaller club logos */
        .club-grid .partner-logo-cell img {
          height: 48px;
        }
        .partner-logo-cell:hover img {
          opacity: 1;
        }
      `}</style>

<motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: "'Albert Sans', sans-serif",
          fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)",
          lineHeight: 1.8,
          color: "var(--obs-text-muted)",
          fontWeight: 300,
          maxWidth: 500,
          textAlign: "center",
          marginBottom: "3rem",
        }}
      >
        Interested in working with us? Reach out at{" "}
        <SafeLink
          href="mailto:ds3@ucsd.edu"
          style={{
            color: "#19B5CA",
            textDecoration: "none",
            borderBottom: "1px solid rgba(25,181,202,0.35)",
            paddingBottom: 1,
          }}
        >
          ds3@ucsd.edu
        </SafeLink>
        .
      </motion.p>

      <div style={{ height: "clamp(2.5rem, 4vw, 4rem)" }} />

      {/* ───────── Industry Partners ───────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          alignSelf: "flex-start",
        }}
      >
        <div
          style={{
            width: 28,
            height: 2,
            background: "#F58134",
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.68rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#F58134",
          }}
        >
          Industry Partners
        </span>
      </motion.div>

      <LogoGrid entries={industry} />

      <div style={{ height: "clamp(2.5rem, 4vw, 4rem)" }} />

            {/* ───────── Department Partners ───────── */}
            <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          alignSelf: "flex-start",
        }}
      >
        <div
          style={{
            width: 28,
            height: 2,
            background: "#19B5CA",
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.68rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#19B5CA",
          }}
        >
          On-Campus & Department Partners
        </span>
      </motion.div>

      <LogoGrid entries={department} delay={0.1} />

      <div style={{ height: "clamp(2.5rem, 4vw, 4rem)" }} />

      {/* ───────── Club Partners ───────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          alignSelf: "flex-start",
        }}
      >
        <div
          style={{
            width: 28,
            height: 2,
            background: "#a78bfa",
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.68rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#a78bfa",
          }}
        >
          Club Partners
        </span>
      </motion.div>

      <LogoGrid entries={clubs} delay={0.1} variant="club" />

      {/* ───────── Disclaimer ───────── */}
      <p
        style={{
          marginTop: "2.5rem",
          fontFamily: "ui-monospace, monospace",
          fontSize: "0.62rem",
          lineHeight: 1.75,
          letterSpacing: "0.04em",
          color: "var(--obs-text-faint)",
          textAlign: "center",
          maxWidth: 620,
        }}
      >
        Partnerships listed do not imply sponsorship or official endorsement.
        They indicate that DS3 has worked with the listed organization or its employee(s) in some
        capacity within the past 365 days — including but not limited to sponsorship, workshops, DataHacks, or other
        collaborative events. The actions and views of DS3 do not reflect those
        of our partners, and vice versa.
      </p>
    </Section>
  );
};

export default OurPartners;