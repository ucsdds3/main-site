import { motion } from "framer-motion";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import consultingData from "../Data/consulting.json";

const ConsultingProjects = () => {
  const projects = consultingData.projects;

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
          <div style={{ width: 22, height: 2, background: "#19B5CA", borderRadius: 2 }} />
          <span style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#19B5CA",
          }}>Past work</span>
        </div>
        <h2 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
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
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "clamp(1.25rem, 2vw, 1.75rem)",
              border: "1px solid var(--obs-border, rgba(128,128,128,0.18))",
              borderRadius: "0.75rem",
              transition: "border-color 0.25s ease",
              position: "relative",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#19B5CA")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--obs-border, rgba(128,128,128,0.18))")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "0.5rem",
                background: "rgba(25,181,202,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#19B5CA", fontSize: "1rem",
              }}>
                <FaGithub />
              </div>
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--obs-text-primary)", opacity: 0.3 }}>
                  <FaExternalLinkAlt size={12} />
                </a>
              )}
            </div>

            <h3 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(1.1rem, 1.6vw, 1.4rem)",
              fontWeight: 400,
              color: "var(--obs-text-primary)",
              margin: 0, lineHeight: 1.2,
            }}>{project.title}</h3>

            <p style={{
              fontSize: "clamp(0.82rem, 1vw, 0.92rem)",
              color: "var(--obs-text-primary)",
              opacity: 0.55, margin: 0, lineHeight: 1.65, flexGrow: 1,
            }}>{project.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ConsultingProjects;