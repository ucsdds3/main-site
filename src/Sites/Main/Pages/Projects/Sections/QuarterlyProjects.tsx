import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";

import projectsData from "../Data/projects.json";

type QuarterKey = keyof typeof projectsData.projects;
type QuarterProject = (typeof projectsData.projects)[QuarterKey][number];

const selectStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  fontSize: "0.68rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  background: "transparent",
  border: "1px solid var(--obs-border, rgba(128,128,128,0.25))",
  borderRadius: "0.375rem",
  padding: "0.45rem 2rem 0.45rem 0.75rem",
  color: "var(--obs-text-primary)",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23F58134' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.6rem center",
  minWidth: "11rem",
};

function normalizeLink(raw: string | null | undefined) {
  if (!raw) return "";
  return raw.trim().replace(/:+$/, "");
}

function getPrimaryLink(project: QuarterProject) {
  const website = normalizeLink(project.website);
  if (website) return website;
  const github = normalizeLink(project.github_repository);
  if (github) return github;
  return "";
}

const QuarterlyProjects = () => {
  const allProjects = projectsData.projects;
  const quarters = Object.keys(allProjects).reverse() as QuarterKey[];
  const [quarter, setQuarter] = useState<QuarterKey>(quarters[0]);

  const projects = useMemo(() => allProjects[quarter], [allProjects, quarter]);

  return (
    <div style={{ width: "100%" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          marginBottom: "1.7rem",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.7rem" }}>
            <div style={{ width: 22, height: 2, background: "#F58134", borderRadius: 2 }} />
            <span
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#F58134",
              }}
            >
              Current cycle
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
              fontWeight: 400,
              color: "var(--obs-text-primary)",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Project Showcase
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.58rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--obs-text-primary)",
              opacity: 0.45,
            }}
          >
            Quarter
          </span>
          <select value={quarter} style={selectStyle} onChange={e => setQuarter(e.target.value as QuarterKey)}>
            {quarters.map((q, i) => (
              <option
                key={i}
                value={q}
                style={{
                  backgroundColor: "#020815",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {q}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(clamp(260px, 28vw, 380px), 1fr))",
          gap: "clamp(1rem, 2vw, 1.5rem)",
        }}
      >
        {projects.map((project, index) => {
          const primaryLink = getPrimaryLink(project);
          const githubLink = normalizeLink(project.github_repository);

          return (
            <motion.div
              key={`${quarter}-${project.title}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                padding: "clamp(1.25rem, 2vw, 1.75rem)",
                border: "1px solid var(--obs-border, rgba(128,128,128,0.18))",
                borderRadius: "0.75rem",
                transition: "border-color 0.25s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#F58134")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--obs-border, rgba(128,128,128,0.18))")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "0.5rem",
                    background: "rgba(245,129,52,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#F58134",
                    fontSize: "1rem",
                  }}
                >
                  <FaGithub />
                </div>
                {primaryLink && (
                  <a
                    href={primaryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--obs-text-primary)", opacity: 0.35 }}
                  >
                    <FaExternalLinkAlt size={12} />
                  </a>
                )}
              </div>

              <h3
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "clamp(1.05rem, 1.45vw, 1.32rem)",
                  fontWeight: 400,
                  color: "var(--obs-text-primary)",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {project.title}
              </h3>

              <p
                style={{
                  fontSize: "clamp(0.82rem, 1vw, 0.92rem)",
                  color: "var(--obs-text-primary)",
                  opacity: 0.55,
                  margin: 0,
                  lineHeight: 1.65,
                  flexGrow: 1,
                }}
              >
                {project.description}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "auto" }}>
                {project.mentor && (
                  <span
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: "0.58rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      padding: "0.2rem 0.55rem",
                      borderRadius: "2rem",
                      border: "1px solid rgba(245,129,52,0.3)",
                      color: "#F58134",
                      background: "rgba(245,129,52,0.08)",
                    }}
                  >
                    Mentor: {project.mentor}
                  </span>
                )}

                {githubLink && (
                  <a
                    href={githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: "0.58rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      padding: "0.2rem 0.55rem",
                      borderRadius: "2rem",
                      border: "1px solid var(--obs-border, rgba(128,128,128,0.2))",
                      color: "var(--obs-text-primary)",
                      opacity: 0.75,
                      textDecoration: "none",
                    }}
                  >
                    GitHub
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QuarterlyProjects;
