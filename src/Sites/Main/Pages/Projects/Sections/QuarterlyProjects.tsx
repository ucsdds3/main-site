import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";

import projectsData from "../Data/projects.json";

type QuarterKey = keyof typeof projectsData.projects;
type QuarterProject = (typeof projectsData.projects)[QuarterKey][number];

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
  const quarters = ["Fall 2025", "Winter 2026"] as const;
  type SelectQuarter = (typeof quarters)[number];
  const [quarter, setQuarter] = useState<SelectQuarter>("Fall 2025");

  const projects = useMemo(
    () => ((allProjects as Record<string, QuarterProject[]>)[quarter] ?? []),
    [allProjects, quarter]
  );

  return (
    <div className="w-full">
      <motion.div
        className="mb-[1.7rem] flex flex-wrap items-end justify-between gap-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <div className="mb-[0.7rem] flex items-center gap-[0.6rem]">
            <div className="obs-accent-bar-orange" />
            <span className="text-eyebrow text-eyebrow-orange">Current cycle</span>
          </div>
          <h2 className="text-fluid-subsection-title">Project Showcase</h2>
        </div>

        <div className="flex flex-col gap-[0.3rem]">
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-(--obs-text-primary) opacity-[0.45]">
            Quarter
          </span>
          <select
            value={quarter}
            className="obs-select min-w-44 text-(--obs-text-primary)"
            onChange={e => setQuarter(e.target.value as SelectQuarter)}
          >
            {quarters.map((q, i) => (
              <option key={i} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(260px,28vw,380px),1fr))] gap-[clamp(1rem,2vw,1.5rem)]">
        {projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-(--obs-border) p-[clamp(1.2rem,2vw,1.6rem)]"
          >
            <p className="m-0 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-(--obs-text-primary) opacity-70">
              Winter 2026 projects coming soon
            </p>
          </motion.div>
        )}
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
              className="flex flex-col gap-4 rounded-xl border border-(--obs-border) p-[clamp(1.25rem,2vw,1.75rem)] transition-[border-color] duration-[0.25s] hover:border-[#F58134]"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[rgba(245,129,52,0.1)] text-base text-[#F58134]">
                  <FaGithub />
                </div>
                {primaryLink && (
                  <a href={primaryLink} target="_blank" rel="noopener noreferrer" className="text-(--obs-text-primary) opacity-35">
                    <FaExternalLinkAlt size={12} />
                  </a>
                )}
              </div>

              <h3 className="m-0 font-heading text-[clamp(1.05rem,1.45vw,1.32rem)] font-normal leading-tight text-(--obs-text-primary)">
                {project.title}
              </h3>

              <p className="m-0 grow text-[clamp(0.82rem,1vw,0.92rem)] leading-[1.65] text-(--obs-text-primary) opacity-[0.55]">
                {project.description}
              </p>

              <div className="mt-auto flex flex-wrap gap-[0.4rem]">
                {project.mentor && (
                  <span className="rounded-4xl border border-[rgba(245,129,52,0.3)] bg-[rgba(245,129,52,0.08)] px-[0.55rem] py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[#F58134]">
                    Mentor: {project.mentor}
                  </span>
                )}

                {githubLink && (
                  <a
                    href={githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-4xl border border-(--obs-border) px-[0.55rem] py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-(--obs-text-primary) no-underline opacity-75"
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
