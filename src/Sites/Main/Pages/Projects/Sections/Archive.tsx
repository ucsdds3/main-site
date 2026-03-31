import { useState } from "react";
import { motion } from "framer-motion";
import { FaExternalLinkAlt } from "react-icons/fa";

import Paginate from "src/Shared/Components/Paginate";
import type { ProjectType } from "src/Utils/types";

import projectsData from "../Data/projects.json";

const PER_PAGE = 4;

function normalizeLink(raw: string | null | undefined) {
  if (!raw) return "";
  return raw.trim().replace(/:+$/, "");
}

const Archive = () => {
  const archive = projectsData.archive as Record<string, ProjectType[]>;
  const years = Object.keys(archive).reverse();
  const [year, setYear] = useState<string>(() => years[0] ?? "");
  const [page, setPage] = useState(1);

  const yearProjects = year ? archive[year] ?? [] : [];
  const numPages = Math.ceil(yearProjects.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const pageProjects = yearProjects.slice(start, start + PER_PAGE);

  return (
    <div className="w-full">
      {/* Header row */}
      <motion.div
        className="mb-5 flex flex-wrap items-end justify-between gap-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <div className="mb-[0.7rem] flex items-center gap-[0.6rem]">
            <div className="obs-accent-bar-orange" />
            <span className="text-eyebrow text-eyebrow-orange">Past work</span>
          </div>
          <h2 className="text-fluid-subsection-title">Project Archive</h2>
        </div>

        <div className="flex flex-col gap-[0.3rem]">
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-(--obs-text-primary) opacity-[0.45]">
            Year
          </span>
          <select
            value={year}
            className="obs-select text-(--obs-text-primary)"
            onChange={e => {
              setPage(1);
              setYear(e.target.value);
            }}
          >
            {years.map((y, i) => (
              <option key={i} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(260px,28vw,380px),1fr))] gap-[clamp(1rem,2vw,1.5rem)]">
        {pageProjects.map((project: ProjectType, index: number) => (
          <motion.div
            key={`${year}-${page}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4 rounded-xl border border-(--obs-border) p-[clamp(1.25rem,2vw,1.75rem)] transition-[border-color] duration-[0.25s] hover:border-[#F58134]"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-[2rem] border border-(--obs-border) px-[0.58rem] py-[0.22rem] font-mono text-[0.58rem] uppercase tracking-[0.12em] text-(--obs-text-primary) opacity-[0.78]">
                {year}
              </span>

              {normalizeLink("link" in project ? (project.link as string | undefined) : undefined) && (
                <a
                  href={normalizeLink("link" in project ? (project.link as string | undefined) : undefined)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--obs-text-primary) opacity-35"
                >
                  <FaExternalLinkAlt size={12} />
                </a>
              )}
            </div>

            <div className="aspect-video w-full overflow-hidden rounded-[0.55rem] border border-(--obs-border) bg-[rgba(255,255,255,0.03)]">
              <img src={project.image} alt={project.title} className="block size-full object-cover" />
            </div>

            <h3 className="m-0 font-heading text-[clamp(1.05rem,1.45vw,1.32rem)] font-normal leading-tight text-(--obs-text-primary)">
              {project.title}
            </h3>

            <p className="m-0 flex-grow text-[clamp(0.82rem,1vw,0.92rem)] leading-[1.65] text-(--obs-text-primary) opacity-[0.55]">
              {project.description}
            </p>

            <div className="mt-auto flex flex-wrap gap-[0.4rem]">
              {"placement" in project && typeof project.placement === "number" && (
                <span className="rounded-[2rem] border border-[rgba(245,129,52,0.3)] bg-[rgba(245,129,52,0.08)] px-[0.55rem] py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[#F58134]">
                  Placement: #{project.placement}
                </span>
              )}

              {normalizeLink("link" in project ? (project.link as string | undefined) : undefined) && (
                <a
                  href={normalizeLink("link" in project ? (project.link as string | undefined) : undefined)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[2rem] border border-(--obs-border) px-[0.55rem] py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-(--obs-text-primary) no-underline opacity-75"
                >
                  View Project
                </a>
              )}
            </div>
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

export default Archive;
