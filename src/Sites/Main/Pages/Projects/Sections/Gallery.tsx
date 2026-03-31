import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaGithub, FaFilePowerpoint, FaGlobe } from "react-icons/fa";

import projectsData from "../Data/projects.json";
import { ChevronDownSmallIcon } from "src/Shared/icons/ChevronDownSmallIcon";
import { ORANGE_SELECT_CHEVRON_DATA_URL } from "src/Shared/icons/orangeSelectChevronDataUrl";

const INITIAL_SHOW = 6;


const selectStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
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
  backgroundImage: ORANGE_SELECT_CHEVRON_DATA_URL,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.6rem center",
  minWidth: "11rem",
};

interface Project {
  title: string;
  description: string;
  github_repository: string | null;
  presentation_slides: string | null;
  website: string | null;
  projects_points: number;
  presentation_points: number;
  mentor?: string;
}


const placementConfig: Record<number, { bg: string; text: string }> = {
  1: { bg: "#F59E0B", text: "1st" },
  2: { bg: "#9CA3AF", text: "2nd" },
  3: { bg: "#B45309", text: "3rd" },
};

const ProjectCard = ({ project, rank }: { project: Project; rank: number }) => {
  const badge = placementConfig[rank];

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
    { icon: <FaGlobe />, href: project.website, title: "Website" },
    { icon: <FaGithub />, href: project.github_repository, title: "GitHub" },
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
      {/* Top row: 3 horizontal icons (left) + badge (right) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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

        {badge && (
          <div style={{
            padding: "0.2rem 0.65rem",
            borderRadius: "2rem",
            background: badge.bg,
            color: "#fff",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            {badge.text}
          </div>
        )}
      </div>

      {/* Title */}
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

      {/* Description */}
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

const Gallery = () => {
  const projects = projectsData.projects;
  type YearType = keyof typeof projects;
  const years = Object.keys(projects) as YearType[];
  const [year, setYear] = useState<YearType>(years[0]);
  const [order, setOrder] = useState<"Projects" | "Presentation">("Projects");
  const [showAll, setShowAll] = useState(false);

  const isWinter = year === "Winter 2026";

  const sortedProjects = useMemo(() =>
    [...(projects[year] as Project[])].sort((a, b) =>
      !isWinter && order === "Presentation"
        ? b.presentation_points - a.presentation_points
        : b.projects_points - a.projects_points
    ),
    [year, order, isWinter]
  );

  const visibleProjects = showAll ? sortedProjects : sortedProjects.slice(0, INITIAL_SHOW);
  const hasMore = !showAll && sortedProjects.length > INITIAL_SHOW;

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.7rem" }}>
            <div style={{ width: 22, height: 2, background: "#F58134", borderRadius: 2 }} />
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#F58134",
            }}>Ranked by score</span>
          </div>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
            fontWeight: 400,
            color: "var(--obs-text-primary)",
            margin: 0,
            lineHeight: 1.1,
          }}>Project Gallery</h2>
        </div>

        {/* Order by dropdown — only for years with presentation points */}
        {!isWinter && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.58rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--obs-text-primary)",
              opacity: 0.45,
            }}>Order by</span>
            <select
              value={order}
              style={selectStyle}
              onChange={e => { setShowAll(false); setOrder(e.target.value as "Projects" | "Presentation"); }}
            >
              <option value="Projects">Project Points</option>
              <option value="Presentation">Presentation Points</option>
            </select>
          </div>
        )}
      </motion.div>

      {/* Year pill tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
        {years.map(y => (
          <button
            key={y}
            onClick={() => { setShowAll(false); setYear(y); if (y === "Winter 2026") setOrder("Projects"); }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "0.3rem 0.85rem",
              borderRadius: "2rem",
              border: "1px solid",
              borderColor: y === year ? "#F58134" : "var(--obs-border, rgba(128,128,128,0.25))",
              background: y === year ? "rgba(245,129,52,0.12)" : "transparent",
              color: y === year ? "#F58134" : "var(--obs-text-primary)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              opacity: y === year ? 1 : 0.5,
            }}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Cards grid or empty state */}
      {sortedProjects.length === 0 ? (
        <div style={{
          padding: "4rem 2rem",
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--obs-text-faint, rgba(128,128,128,0.35))",
        }}>
          Projects coming soon
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(clamp(280px, 28vw, 380px), 1fr))",
          gap: "clamp(1rem, 2vw, 1.5rem)",
        }}>
          {visibleProjects.map((project, index) => (
            <ProjectCard
              key={`${year}-${index}`}
              project={project}
              rank={index + 1}
            />
          ))}
        </div>
      )}

      {/* Show More button */}
      {hasMore && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
          <button
            onClick={() => setShowAll(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "0.6rem 1.5rem",
              borderRadius: "2rem",
              border: "1px solid var(--obs-border, rgba(128,128,128,0.25))",
              background: "transparent",
              color: "var(--obs-text-primary)",
              cursor: "pointer",
              opacity: 0.6,
              transition: "opacity 0.2s ease, border-color 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "#F58134"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.borderColor = "var(--obs-border, rgba(128,128,128,0.25))"; }}
          >
            Show More
            <ChevronDownSmallIcon className="text-[var(--obs-text-primary)]" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
