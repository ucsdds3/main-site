import { motion } from "framer-motion";
import SafeLink from "src/Shared/Components/SafeLink";
import useImagePreloader from "src/Hooks/useImagepreload.tsx";
import { useTheme } from "src/Hooks/useTheme";

import partners from "../Data/partners.json";

const partnerDisplayNames = partners.displayNames as Record<string, string>;

function partnerFullName(shortKey: string): string {
  return partnerDisplayNames[shortKey] ?? shortKey;
}

const DEPARTMENT_KEYS = [
  "SCIDS", "Basement", "Scripps", "COGS",
  "Rady School of Management", "CSE",
  "Jacobs School of Engineering", "BRAIN",
];

const CLUB_KEYS = [
  "Triton Ball", "AISC", "AWS Cloud Club",
  "Biomedical Engineering Society (BMES)", "CBC", "CSSA",
  "DS3", "Emblem", "GDG", "Product Management Club (PMC)",
  "Startup Incubator Club", "SUMS", "TESC",
  "Triton Quantitative Trading (TQT)", "Triton Software Engineering (TSE)",
];

const OurPartners = () => {
  const { isDark } = useTheme();
  const logos = (isDark ? partners.dark : partners.light) as Record<string, PartnerEntry>;
  const darkLogoFilter = "brightness(1.14) contrast(1.08) saturate(0.95)";
  const darkLogoScaleByFile: Record<string, number> = {
    "/Partners/amazon_dark.png": 2.2,
    "/Partners/scripps_dark.png": 2.15,
    "/Partners/scids_dark.png": 2.15,
    "/Partners/jacobs_dark.png": 2.15,
    "/Partners/basement_dark.png": 2.15,
    "/Partners/databricks_dark.png": 2.25,
    "/Clubs/aws_dark.png": 2.2,
  };
  const uploadedDarkLogos = Object.keys(darkLogoScaleByFile);
  const { imageStates } = useImagePreloader(isDark ? uploadedDarkLogos : []);
  const getLogoStyle = (src: string): React.CSSProperties => {
    const isUploadedDarkVariant = isDark && src in darkLogoScaleByFile;
    if (isUploadedDarkVariant) {
      // Uploaded dark variants contain black fills; screen blend removes black backdrop.
      return {
        mixBlendMode: "screen",
        filter: "none",
        transform: `scale(${darkLogoScaleByFile[src] ?? 2.15})`,
        transformOrigin: "center",
        opacity: imageStates[src] ? undefined : 0,
      };
    }
    return {
      filter: isDark ? darkLogoFilter : "none",
    };
  };

  const department = Object.entries(logos).filter(([name]) => DEPARTMENT_KEYS.includes(name));
  const clubs = Object.entries(logos).filter(([name]) => CLUB_KEYS.includes(name));
  const industry = Object.entries(logos).filter(
    ([name]) => !DEPARTMENT_KEYS.includes(name) && !CLUB_KEYS.includes(name)
  );

  const SectionLabel = ({
    label,
    color,
    delay = 0,
  }: {
    label: string;
    color: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1.25rem" }}
    >
      <div style={{ width: 22, height: 2, background: color, borderRadius: 2, flexShrink: 0 }} />
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
      }}>
        {label}
      </span>
    </motion.div>
  );

  const LogoGrid = ({
    entries,
    delay = 0,
    variant = "default",
  }: {
    entries: [string, PartnerEntry][];
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
      {entries.map(([name, entry], index) => {
        const { src, href } = typeof entry === "string" ? { src: entry, href: undefined } : entry;
        const fullName = partnerFullName(name);
        const isUploadedDarkVariant = isDark && src in darkLogoScaleByFile;
        const showPreloadPlaceholder = isUploadedDarkVariant && !imageStates[src];
        const logoContent = (
          <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
            {showPreloadPlaceholder && (
              <div
                className="partner-logo-preload"
                style={{
                  width: "72%",
                  height: variant === "club" ? "30px" : "44px",
                }}
                aria-hidden="true"
              />
            )}
            <img
              src={src}
              alt={fullName}
              style={getLogoStyle(src)}
              loading={isUploadedDarkVariant ? "eager" : "lazy"}
            />
          </div>
        );
        return (
        <motion.div
          key={name}
          className="partner-logo-cell"
          title={fullName}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.04 }}
        >
          {href ? (
            <SafeLink
              href={href}
              style={{
                flex: 1,
                alignSelf: "stretch",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                minHeight: "100%",
              }}
            >
              {logoContent}
            </SafeLink>
          ) : (
            logoContent
          )}
        </motion.div>
      )})}
    </motion.div>
  );

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1300,
        margin: "0 auto",
        padding: "clamp(2.5rem, 5vw, 5rem) clamp(1.25rem, 4vw, 3rem)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        .partner-logo-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 2.15rem 2.25rem;
          border-right: 1px solid var(--obs-border);
          border-bottom: 1px solid var(--obs-border);
          transition: background 0.25s ease;
        }
        .partner-logo-cell:hover { background: var(--obs-surface); }
        .partner-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(clamp(100px, 20vw, 200px), 1fr));
          border-top: 1px solid var(--obs-border);
          border-left: 1px solid var(--obs-border);
          width: 100%;
        }
        .partner-logo-cell img {
          width: 100%;
          height: 92px;
          object-fit: contain;
          opacity: 0.82;
          transition: opacity 0.3s ease, filter 0.3s ease, transform 0.3s ease;
        }
        .partner-logo-preload {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 0.55rem;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.04) 0%,
            rgba(255,255,255,0.12) 50%,
            rgba(255,255,255,0.04) 100%
          );
          background-size: 220% 100%;
          animation: logo-preload-shimmer 1.15s ease-in-out infinite;
        }
        @keyframes logo-preload-shimmer {
          0% { background-position: -160% 0; }
          100% { background-position: 160% 0; }
        }
        .club-grid .partner-logo-cell img { height: 58px; }
        .partner-logo-cell:hover img { opacity: 1; }
      `}</style>

      {/* ── Editorial header ── */}
      <div style={{ borderBottom: "1px solid var(--obs-border, rgba(128,128,128,0.2))", marginBottom: "clamp(2.5rem, 4vw, 4rem)", paddingBottom: "clamp(1.5rem, 3vw, 3rem)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(3rem, 7vw, 6rem)",
              fontWeight: 400,
              lineHeight: 0.95,
              color: "var(--obs-text-primary)",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Our Partners
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
              color: "var(--obs-text-primary)",
              opacity: 0.68,
              margin: 0,
              maxWidth: 380,
              lineHeight: 1.7,
              textAlign: "right",
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
        </div>
      </div>

      {/* ── Industry ── */}
      <SectionLabel label="Industry Partners" color="#F58134" />
      <LogoGrid entries={industry} />

      <div style={{ height: "clamp(2.5rem, 4vw, 4rem)" }} />

      {/* ── Departments ── */}
      <SectionLabel label="On-Campus & Department Partners" color="#19B5CA" delay={0.05} />
      <LogoGrid entries={department} delay={0.1} />

      <div style={{ height: "clamp(2.5rem, 4vw, 4rem)" }} />

      {/* ── Clubs ── */}
      <SectionLabel label="Club Partners" color="#a78bfa" delay={0.05} />
      <LogoGrid entries={clubs} delay={0.1} variant="club" />

      {/* ── Disclaimer ── */}
      <p style={{
        marginTop: "2.5rem",
        fontFamily: "var(--font-mono)",
        fontSize: "0.7rem",
        lineHeight: 1.75,
        letterSpacing: "0.04em",
        color: "var(--obs-text-faint)",
        textAlign: "center",
        maxWidth: 620,
        alignSelf: "center",
      }}>
        Partnerships listed do not imply sponsorship or official endorsement.
        They indicate that DS3 has worked with the listed organization or its employee(s) in some
        capacity within the past 365 days — including but not limited to sponsorship, workshops,
        DataHacks, or other collaborative events. The actions and views of DS3 do not reflect those
        of our partners, and vice versa.
      </p>
    </div>
  );
};

export default OurPartners;

type PartnerEntry = string | { src: string; href?: string };