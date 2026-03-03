import { motion } from "framer-motion";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

import opensourceData from "../Data/opensource.json";

const RepoShowcase = () => {
  const repos = opensourceData.repos;

  return (
    <div style={{ width: "100%" }}>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: "2rem" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.7rem" }}>
          <div style={{ width: 22, height: 2, background: "#F58134", borderRadius: 2 }} />
          <span style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#F58134",
          }}>
            On GitHub
          </span>
        </div>
        <h2 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
          fontWeight: 400,
          color: "var(--obs-text-primary)",
          margin: 0,
          lineHeight: 1.1,
        }}>
          Contributed Repositories
        </h2>
      </motion.div>

      {/* Repo cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(clamp(280px, 30vw, 380px), 1fr))",
        gap: "clamp(1rem, 2vw, 1.5rem)",
      }}>
        {repos.map((repo, index) => (
          <motion.a
            key={index}
            href={repo.github}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "clamp(1.25rem, 2vw, 1.75rem)",
              border: "1px solid var(--obs-border, rgba(128,128,128,0.18))",
              borderRadius: "0.75rem",
              textDecoration: "none",
              background: "transparent",
              transition: "border-color 0.25s ease",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#F58134")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--obs-border, rgba(128,128,128,0.18))")}
          >
            {/* Top row: icon + external link */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: "0.5rem",
                background: "rgba(245,129,52,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F58134",
                fontSize: "1rem",
              }}>
                <FaGithub />
              </div>
              <FaExternalLinkAlt style={{
                fontSize: "0.75rem",
                color: "var(--obs-text-primary)",
                opacity: 0.3,
              }} />
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(1.1rem, 1.6vw, 1.4rem)",
              fontWeight: 400,
              color: "var(--obs-text-primary)",
              margin: 0,
              lineHeight: 1.2,
            }}>
              {repo.title}
            </h3>

            {/* Description */}
            <p style={{
              fontFamily: "inherit",
              fontSize: "clamp(0.82rem, 1vw, 0.92rem)",
              color: "var(--obs-text-primary)",
              opacity: 0.58,
              margin: 0,
              lineHeight: 1.65,
              flexGrow: 1,
            }}>
              {repo.description}
            </p>

            {/* Tags */}
            {repo.tags && repo.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "auto" }}>
                {repo.tags.map((tag, i) => (
                  <span key={i} style={{
                    fontFamily: "ui-monospace, monospace",
                    fontSize: "0.58rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "0.2rem 0.55rem",
                    borderRadius: "2rem",
                    border: "1px solid var(--obs-border, rgba(128,128,128,0.2))",
                    color: "var(--obs-text-primary)",
                    opacity: 0.55,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default RepoShowcase;