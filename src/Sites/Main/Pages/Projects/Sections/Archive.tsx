import { useState } from "react";
import { motion } from "framer-motion";

import HoverCard from "src/Shared/Components/HoverCard";
import Paginate from "src/Shared/Components/Paginate";

import projectsData from "../Data/projects.json";

const PER_PAGE = 4;

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
  minWidth: "9rem",
};

const Archive = () => {
  const archive = projectsData.archive;
  type YearType = keyof typeof archive;
  const years = Object.keys(archive).reverse() as YearType[];
  const [year, setYear] = useState<YearType>(years[0]);
  const [page, setPage] = useState(1);

  const yearProjects = archive[year];
  const numPages = Math.ceil(yearProjects.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const pageProjects = yearProjects.slice(start, start + PER_PAGE);

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
          marginBottom: "1.25rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.7rem" }}>
            <div style={{ width: 22, height: 2, background: "#F58134", borderRadius: 2 }} />
            <span style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#F58134",
            }}>Past work</span>
          </div>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
            fontWeight: 400,
            color: "var(--obs-text-primary)",
            margin: 0,
            lineHeight: 1.1,
          }}>Project Archive</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <span style={{
            fontFamily: "ui-monospace, monospace",
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
      </motion.div>

      {/* Year pill tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {years.map(y => (
          <button key={y} onClick={() => { setPage(1); setYear(y); }} style={{
            fontFamily: "ui-monospace, monospace",
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
          }}>{y}</button>
        ))}
      </div>

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
              link={"link" in project && project.link ? (project.link as string) : undefined}
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

export default Archive;