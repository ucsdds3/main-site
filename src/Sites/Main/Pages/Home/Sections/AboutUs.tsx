import type { CSSProperties } from "react";
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

function aboutRowAccentVars(accent: string, accentGlow: string): CSSProperties {
  return {
    "--au-accent": accent,
    "--au-glow": `${accentGlow}0.7)`,
    "--au-radial": `${accentGlow}0.1)`,
  } as CSSProperties;
}

const AboutUs = () => {
  const { navigate } = useSiteHandler();
  const { imageStates } = useImagePreloader(data.map((d) => d.image));

  return (
    <div id="about-us-root" className="relative">
      <Section title="About Us">
        <div className="mt-14 flex flex-col gap-[clamp(5rem,9vw,8rem)]">
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
                className={`flex w-full flex-col gap-[clamp(2rem,4vw,3.5rem)] ${isEven ? "lg:flex-row-reverse" : "lg:flex-row"}`}
                style={aboutRowAccentVars(accent, accentGlow)}
              >
                {/* ── Text column ── */}
                <div className="flex flex-1 flex-col justify-center gap-[1.4rem]">
                  <div className="flex items-center gap-3">
                    <div className="h-0.5 w-7 shrink-0 rounded-sm bg-(--au-accent) shadow-[0_0_8px_var(--au-glow)]" />
                    <span className="text-eyebrow text-(--au-accent)">{section.section}</span>
                  </div>

                  <h2 className="m-0 font-heading text-[clamp(2rem,3.2vw,3rem)] font-normal leading-tight text-(--obs-text-primary)">
                    {section.title}
                  </h2>

                  <div className="obs-divider-fade w-full" />

                  <p className="font-body m-0 font-light fl-text-base/lg leading-[1.85] text-(--obs-text-muted)">
                    {section.content}
                  </p>

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

                <motion.div variants={imgVariants} className="flex flex-1 items-center">
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-(--obs-border) shadow-[0_24px_64px_rgba(0,0,0,0.5),inset_0_1px_0_var(--obs-surface)]">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-1 bg-[linear-gradient(135deg,var(--obs-surface)_0%,transparent_50%)]"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute left-0 top-0 z-1 h-1/2 w-1/2 bg-[radial-gradient(circle_at_0%_0%,var(--au-radial)_0%,transparent_65%)]"
                    />

                    {imageStates[section.image] ? (
                      <img
                        src={section.image}
                        alt={section.section}
                        className="block size-full object-cover"
                      />
                    ) : (
                      <div className="img-skeleton size-full" />
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
