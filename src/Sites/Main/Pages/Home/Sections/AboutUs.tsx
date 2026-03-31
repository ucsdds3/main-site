import { motion, type Variants } from "framer-motion";
import { Link } from "react-router";

import { useSiteHandler } from "src/Hooks/useSiteHandler";
import Section from "src/Shared/Page/Section";
import useImagePreloader from "src/Hooks/useImagepreload";

import data from "../Data/aboutUs.json";

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const imgVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
  },
};

const ACCENT = ["#19B5CA", "#F58134"];
const ACCENT_GLOW = ["rgba(25,181,202,", "rgba(245,129,52,"];

const HASH_LINK = /^\/#([\w-]+)$/;

const AboutUs = () => {
  const { navigate } = useSiteHandler();
  const { imageStates } = useImagePreloader(data.map((d) => d.image));

  return (
    <div id="about-us-root" style={{ position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');

        #about-us-root > *,
        #about-us-root section,
        #about-us-root [class*="section"],
        #about-us-root [class*="Section"] {
          background: transparent !important;
          background-color: transparent !important;
        }

        .about-row {
          display: flex;
          flex-direction: column;
          gap: clamp(2rem, 4vw, 3.5rem);
          width: 100%;
        }
        @media (min-width: 1024px) {
          .about-row-even { flex-direction: row-reverse; }
          .about-row-odd  { flex-direction: row; }
        }

        .obs-link {
          display: inline-block;
          padding: 0.85rem 2rem;
          border-radius: 9999px;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--obs-text-primary);
          background: var(--obs-surface);
          backdrop-filter: blur(8px);
          transition: background 0.25s ease, border-color 0.25s ease,
                      color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 4px 24px rgba(0,0,0,0.25);
        }
        .obs-link:hover {
          color: var(--obs-text-primary);
          transform: translateY(-2px);
        }
        .obs-link-teal  { border: 1px solid rgba(25,181,202,0.35); }
        .obs-link-teal:hover {
          background: rgba(25,181,202,0.12);
          border-color: rgba(25,181,202,0.7);
          box-shadow: 0 12px 36px rgba(25,181,202,0.18);
        }
        .obs-link-orange { border: 1px solid rgba(245,129,52,0.35); }
        .obs-link-orange:hover {
          background: rgba(245,129,52,0.12);
          border-color: rgba(245,129,52,0.7);
          box-shadow: 0 12px 36px rgba(245,129,52,0.18);
        }

        @keyframes shimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 0.7; }
          100% { opacity: 0.4; }
        }
        .img-skeleton {
          animation: shimmer 2s ease-in-out infinite;
          background: linear-gradient(135deg, var(--obs-surface) 0%, rgba(255,255,255,0.02) 100%);
        }
      `}</style>

      <Section title="About Us">
        <div style={{ marginTop: "3.5rem", display: "flex", flexDirection: "column", gap: "clamp(5rem,9vw,8rem)" }}>
          {data.map((section, index) => {
            const isEven = index % 2 === 0;
            const accent = ACCENT[index % 2];
            const accentGlow = ACCENT_GLOW[index % 2];
            const linkClass = `obs-link ${isEven ? "obs-link-teal" : "obs-link-orange"}`;
            const hashMatch = HASH_LINK.exec(section.link);

            return (
              <motion.div
                key={index}
                variants={rowVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className={`about-row ${isEven ? "about-row-even" : "about-row-odd"}`}
              >
                {/* ── Text column ── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "1.4rem" }}>

                  {/* Section label */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 28, height: 2, background: accent, borderRadius: 2, boxShadow: `0 0 8px ${accentGlow}0.7)`, flexShrink: 0 }} />
                    <span className="text-eyebrow" style={{ color: accent }}>
                      {section.section}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2rem,3.2vw,3rem)", fontWeight: 400, lineHeight: 1.1, color: "var(--obs-text-primary)", margin: 0 }}>
                    {section.title}
                  </h2>

                  {/* Rule */}
                  <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,var(--obs-border) 0%,transparent 100%)" }} />

                  {/* Body — inherits site font, no Albert Sans */}
                  <p className="font-body font-light fl-text-base/lg leading-[1.85] text-(--obs-text-muted) m-0">
                    {section.content}
                  </p>

                  {/* CTA */}
                  <div>
                    {hashMatch ? (
                      <button
                        type="button"
                        className={linkClass}
                        onClick={() => navigate({ pathname: "/", hash: hashMatch[1] })}
                      >
                        {section.button}
                      </button>
                    ) : (
                      <Link to={section.link} className={linkClass}>
                        {section.button}
                      </Link>
                    )}
                  </div>
                </div>

                {/* ── Image column ── */}
                <motion.div variants={imgVariants} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <div style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/9",
                    borderRadius: "1rem",
                    overflow: "hidden",
                    border: "1px solid var(--obs-border)",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 var(--obs-surface)",
                  }}>
                    <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,var(--obs-surface) 0%,transparent 50%)", zIndex: 1, pointerEvents: "none" }} />
                    <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: "50%", height: "50%", background: `radial-gradient(circle at 0% 0%,${accentGlow}0.1) 0%,transparent 65%)`, zIndex: 1, pointerEvents: "none" }} />

                    {imageStates[section.image] ? (
                      <img src={section.image} alt={section.section} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <div className="img-skeleton" style={{ width: "100%", height: "100%" }} />
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </Section>
    </div>
  );
};

export default AboutUs;