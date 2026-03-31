import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaFilePowerpoint, FaGithub, FaGlobe } from "react-icons/fa";

import HoverCard from "src/Shared/Components/HoverCard";
import Paginate from "src/Shared/Components/Paginate";

import projectsData from "../Data/projects.json";

const PER_PAGE = 4;

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
    <div className="w-full">
      {/* Header row */}
      <motion.div
        className="mb-6 flex flex-wrap items-end justify-between gap-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <div className="mb-[0.7rem] flex items-center gap-[0.6rem]">
            <div className="obs-accent-bar-orange" />
            <span className="text-eyebrow text-eyebrow-orange">Ranked by score</span>
          </div>
          <h2 className="text-fluid-subsection-title">Project Showcase</h2>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-[0.3rem]">
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-(--obs-text-primary) opacity-[0.45]">
              Order by
            </span>
            <select
              value={order}
              className="obs-select min-w-[11rem] text-(--obs-text-primary)"
              onChange={e => { setPage(1); setOrder(e.target.value as "Projects" | "Presentation"); }}
            >
              <option value="Projects">Project Points</option>
              <option value="Presentation">Presentation Points</option>
            </select>
          </div>
          <div className="flex flex-col gap-[0.3rem]">
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-(--obs-text-primary) opacity-[0.45]">
              Year
            </span>
            <select
              value={year}
              className="obs-select min-w-[11rem] text-(--obs-text-primary)"
              onChange={e => { setPage(1); setYear(e.target.value as YearType); }}
            >
              {years.map((y, i) => <option key={i}>{y}</option>)}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Grid — fixed 4 columns */}
      <div className="grid grid-cols-4 gap-[clamp(0.75rem,1.5vw,1.25rem)]">
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
        <div className="mt-6">
          <Paginate numPages={numPages} page={page} setPage={setPage} />
        </div>
      )}
    </div>
  );
};

export default ShowCase;
