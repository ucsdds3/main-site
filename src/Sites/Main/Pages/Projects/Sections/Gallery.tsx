import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaGithub, FaFilePowerpoint, FaGlobe } from "react-icons/fa";

import projectsData from "../Data/projects.json";
import { ChevronDownSmallIcon } from "src/Shared/icons/ChevronDownSmallIcon";
import { twMerge } from "src/Utils/cn";

const INITIAL_SHOW = 6;

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

const iconLinkClass =
  "flex size-[26px] items-center justify-center rounded-[0.35rem] border border-(--obs-border) bg-transparent text-[0.72rem] no-underline transition-[opacity,border-color] duration-200";
const iconLinkActiveClass = `${iconLinkClass} cursor-pointer text-(--obs-text-primary) opacity-50 hover:border-[#F58134] hover:opacity-100`;
const iconLinkDisabledClass = `${iconLinkClass} cursor-default text-(--obs-text-faint) opacity-20`;

const ProjectCard = ({ project, rank }: { project: Project; rank: number }) => {
  const badge = placementConfig[rank];

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
      className="relative flex flex-col gap-4 rounded-xl border border-(--obs-border) bg-transparent p-[clamp(1.25rem,2vw,1.75rem)] transition-[border-color] duration-[0.25s] hover:border-[#F58134]"
    >
      {/* Top row: 3 horizontal icons (left) + badge (right) */}
      <div className="flex items-center justify-between">
        <div className="flex flex-row gap-[0.3rem]">
          {links.map(({ icon, href, title }) =>
            href ? (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={title}
                onClick={e => e.stopPropagation()}
                className={iconLinkActiveClass}
              >
                {icon}
              </a>
            ) : (
              <div key={title} title={`No ${title}`} className={iconLinkDisabledClass}>
                {icon}
              </div>
            )
          )}
        </div>

        {badge && (
          <div
            className="rounded-4xl px-[0.65rem] py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-widest text-white"
            style={{ background: badge.bg }}
          >
            {badge.text}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="m-0 font-heading text-[clamp(1.1rem,1.6vw,1.4rem)] font-normal leading-tight text-(--obs-text-primary)">
        {project.title}
      </h3>

      {/* Description */}
      <p className="m-0 grow text-[clamp(0.82rem,1vw,0.92rem)] leading-[1.65] text-(--obs-text-primary) opacity-[0.58]">
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
    <div className="w-full">
      {/* Header */}
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
          <h2 className="text-fluid-subsection-title">Project Gallery</h2>
        </div>

        {/* Order by dropdown — only for years with presentation points */}
        {!isWinter && (
          <div className="flex flex-col gap-[0.3rem]">
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-(--obs-text-primary) opacity-[0.45]">
              Order by
            </span>
            <select
              value={order}
              className="obs-select min-w-44 text-(--obs-text-primary)"
              onChange={e => { setShowAll(false); setOrder(e.target.value as "Projects" | "Presentation"); }}
            >
              <option value="Projects">Project Points</option>
              <option value="Presentation">Presentation Points</option>
            </select>
          </div>
        )}
      </motion.div>

      {/* Year pill tabs */}
      <div className="mb-7 flex flex-wrap gap-2">
        {years.map(y => (
          <button
            key={y}
            type="button"
            onClick={() => { setShowAll(false); setYear(y); if (y === "Winter 2026") setOrder("Projects"); }}
            className={twMerge(
              "cursor-pointer rounded-4xl border px-[0.85rem] py-[0.3rem] font-mono text-[0.62rem] uppercase tracking-[0.18em] transition-all duration-200",
              y === year
                ? "border-[#F58134] bg-[rgba(245,129,52,0.12)] text-[#F58134] opacity-100"
                : "border-(--obs-border) bg-transparent text-(--obs-text-primary) opacity-50"
            )}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Cards grid or empty state */}
      {sortedProjects.length === 0 ? (
        <div className="px-8 py-16 text-center font-mono text-[0.72rem] uppercase tracking-[0.18em] text-(--obs-text-faint)">
          Projects coming soon
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(280px,28vw,380px),1fr))] gap-[clamp(1rem,2vw,1.5rem)]">
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
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="flex cursor-pointer items-center gap-2 rounded-4xl border border-(--obs-border) bg-transparent px-6 py-[0.6rem] font-mono text-[0.68rem] uppercase tracking-[0.18em] text-(--obs-text-primary) opacity-60 transition-[opacity,border-color] duration-200 hover:border-[#F58134] hover:opacity-100"
          >
            Show More
            <ChevronDownSmallIcon className="text-(--obs-text-primary)" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
