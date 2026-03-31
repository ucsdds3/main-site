import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaFilePowerpoint, FaGithub, FaGlobe } from "react-icons/fa";

import HoverCard from "src/Shared/Components/HoverCard";
import Paginate from "src/Shared/Components/Paginate";

import { ORANGE_SELECT_CHEVRON_DATA_URL } from "src/Shared/icons/orangeSelectChevronDataUrl";

import projectsData from "../Data/projects.json";

const PER_PAGE = 4;

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

const ShowCase = () => {
  const projects = projectsData.projects;
  type YearType = keyof typeof projects;
  const years = Object.keys(projects).reverse() as YearType[];
  const [year, setYear] = useState<YearType>(years[0]);
  const [order, setOrder] = useState<"Projects" | "Presentation">("Projects");
  const [page, setPage] = useState(1);

  const sortedProjects = useMemo(() => [...projects[year]].sort((a, b) =>
    order === "Projects"
      ? b.projects_points - a.projects_points
      : b.presentation_points - a.presentation_points
  ), [year, order]);

  const numPages = Math.ceil(sortedProjects.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const pageProjects = sortedProjects.slice(start, end);

  const createLinks = (project: (typeof projects)[YearType][0]) => {
    const raw = [
      { title: "GitHub", href: project.github_repository, icon: <FaGithub />, color: "#11B3C9" },
      { title: "Presentation", href: project.presentation_slides, icon: <FaFilePowerpoint />, color: "#F58134" },
      { title: "Website", href: project.website, icon: <FaGlobe />, color: "#222222" },
    ];
    return raw.filter(
      (l): l is { title: string; href: string; icon: (typeof raw)[0]["icon"]; color: string } =>
        typeof l.href === "string" && l.href.length > 0,
    );
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Header row */}
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
          }}>Project Showcase</h2>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.58rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--obs-text-primary)",
              opacity: 0.45,
            }}>Order by</span>
            <select value={order} style={selectStyle}
              onChange={e => { setPage(1); setOrder(e.target.value as "Projects" | "Presentation"); }}>
              <option value="Projects">Project Points</option>
              <option value="Presentation">Presentation Points</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.58rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--obs-text-primary)",
              opacity: 0.45,
            }}>Year</span>
            <select value={year} style={selectStyle}
              onChange={e => { setPage(1); setYear(e.target.value as YearType); }}>
              {years.map((y, i) => <option key={i}>{y}</option>)}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Grid — fixed 4 columns */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "clamp(0.75rem, 1.5vw, 1.25rem)",
      }}>
        {pageProjects.map((project, index) => (
          <motion.div
            key={`${year}-${page}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <HoverCard
              {...project}
              image={project.image ?? undefined}
              placement={page === 1 ? start + index + 1 : undefined}
              links={createLinks(project)}
              size="clamp(160px, 20vw, 280px)"
              imgClassName="border border-primary"
            />
          </motion.div>
        ))}
      </div>

      {numPages > 1 && (
        <div style={{ marginTop: "1.5rem" }}>
          <Paginate numPages={numPages} page={page} setPage={setPage} />
        </div>
      )}
    </div>
  );
};

export default ShowCase;