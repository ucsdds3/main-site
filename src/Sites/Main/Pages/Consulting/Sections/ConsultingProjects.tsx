import { motion } from "framer-motion";
import { FaGithub, FaFilePowerpoint, FaGlobe } from "react-icons/fa";

import consultingData from "../Data/consulting.json";

interface ConsultingProject {
  title: string;
  description: string;
  mentor?: string;
  github_repository: string | null;
  presentation_slides: string | null;
  website: string | null;
}

const iconLinkActive =
  "flex size-[34px] items-center justify-center rounded-[0.35rem] border border-(--obs-border) bg-transparent text-[0.82rem] no-underline opacity-50 transition-[opacity,border-color] duration-200 hover:border-[#19B5CA] hover:opacity-100";
const iconLinkDisabled =
  "flex size-[34px] items-center justify-center rounded-[0.35rem] border border-(--obs-border) bg-transparent text-[0.82rem] opacity-20 cursor-default text-(--obs-text-faint)";

const ProjectCard = ({ project }: { project: ConsultingProject }) => {
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
      className="relative flex flex-col gap-4 rounded-xl border border-(--obs-border) bg-transparent p-[clamp(1.25rem,2vw,1.75rem)] transition-[border-color] duration-[0.25s] hover:border-[#19B5CA]"
    >
      {/* Top row: 3 horizontal icons */}
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
              className={`${iconLinkActive} cursor-pointer text-(--obs-text-primary)`}
            >
              {icon}
            </a>
          ) : (
            <div key={title} title={`No ${title}`} className={iconLinkDisabled}>
              {icon}
            </div>
          )
        )}
      </div>

      {/* Title */}
      <h3 className="m-0 font-heading text-[clamp(1.45rem,2vw,1.9rem)] font-normal leading-tight text-(--obs-text-primary)">
        {project.title}
      </h3>

      {/* Description */}
      <p className="m-0 flex-grow text-[clamp(1.05rem,1.25vw,1.2rem)] leading-[1.65] text-(--obs-text-primary) opacity-[0.58]">
        {project.description}
      </p>
    </motion.div>
  );
};

const ConsultingProjects = () => {
  const projects = consultingData.projects as ConsultingProject[];

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="mb-[0.7rem] flex items-center gap-[0.6rem]">
          <div className="h-0.5 w-[22px] shrink-0 rounded-sm bg-[#19B5CA]" />
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.22em] text-[#19B5CA]">Past work</span>
        </div>
        <h2 className="m-0 font-heading text-[clamp(2rem,3.4vw,3.1rem)] font-normal leading-tight text-(--obs-text-primary)">
          Projects
        </h2>
      </motion.div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(260px,28vw,380px),1fr))] gap-[clamp(1rem,2vw,1.5rem)]">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </div>
  );
};

export default ConsultingProjects;
