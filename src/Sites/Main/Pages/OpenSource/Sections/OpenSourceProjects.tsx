import { motion } from "framer-motion";
import { FaGithub, FaFilePowerpoint, FaGlobe } from "react-icons/fa";

import opensourceData from "../Data/opensource.json";

interface OpenSourceProject {
  title: string;
  description: string;
  mentor?: string;
  github_repository: string | null;
  presentation_slides: string | null;
  website: string | null;
}

const ProjectCard = ({ project }: { project: OpenSourceProject }) => {
  const iconBtnBase: React.CSSProperties = {
    width: 26,
    height: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.35rem",
    border: "1px solid var(--obs-border, rgba(128,128,128,0.2))",
    background: "transparent",
    fontSize: "0.72rem",
    textDecoration: "none",
    transition: "opacity 0.2s ease, border-color 0.2s ease",
  };

  const links = [
    { icon: <FaGithub />, href: project.github_repository, title: "GitHub" },
    { icon: <FaGlobe />, href: project.website, title: "Website" },
    { icon: <FaFilePowerpoint />, href: project.presentation_slides, title: "Slides" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "clamp(1.25rem, 2vw, 1.75rem)",
        border: "1px solid var(--obs-border, rgba(128,128,128,0.18))",
        borderRadius: "0.75rem",
        background: "transparent",
        position: "relative",
        transition: "border-color 0.25s ease",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#F58134")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--obs-border, rgba(128,128,128,0.18))")}
    >
      <div style={{ display: "flex", flexDirection: "row", gap: "0.3rem" }}>
        {links.map(({ icon, href, title }) =>
          href ? (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              onClick={e => e.stopPropagation()}
              style={{ ...iconBtnBase, color: "var(--obs-text-primary)", opacity: 0.5, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "#F58134"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.borderColor = "var(--obs-border, rgba(128,128,128,0.2))"; }}
            >
              {icon}
            </a>
          ) : (
            <div
              key={title}
              title={`No ${title}`}
              style={{ ...iconBtnBase, color: "var(--obs-text-faint, rgba(128,128,128,0.3))", opacity: 0.2, cursor: "default" }}
            >
              {icon}
            </div>
          )
        )}
      </div>

      <h3 style={{
        fontFamily: "var(--font-heading)",
        fontSize: "clamp(1.1rem, 1.6vw, 1.4rem)",
        fontWeight: 400,
        color: "var(--obs-text-primary)",
        margin: 0,
        lineHeight: 1.2,
      }}>
        {project.title}
      </h3>

      <p style={{
        fontSize: "clamp(0.82rem, 1vw, 0.92rem)",
        color: "var(--obs-text-primary)",
        opacity: 0.58,
        margin: 0,
        lineHeight: 1.65,
        flexGrow: 1,
      }}>
        {project.description}
      </p>
    </motion.div>
  );
};

const OpenSourceProjects = () => {
  const projects = opensourceData.projects as OpenSourceProject[];

  return (
    <div style={{ width: "100%" }}>
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
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#F58134",
          }}>Past work</span>
        </div>
        <h2 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
          fontWeight: 400,
          color: "var(--obs-text-primary)",
          margin: 0,
          lineHeight: 1.1,
        }}>Projects</h2>
      </motion.div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(clamp(260px, 28vw, 380px), 1fr))",
        gap: "clamp(1rem, 2vw, 1.5rem)",
      }}>
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </div>
  );
};

export default OpenSourceProjects;
