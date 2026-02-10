import { useState } from "react";
import { twMerge } from "tailwind-merge";

import Section from "src/Shared/Page/Section";
import HoverCard from "src/Shared/Components/HoverCard";
import Paginate from "src/Shared/Components/Paginate";
import { usePaginate } from "src/Hooks/usePaginate.ts";
import { capitalize, formatMemberLinks } from "src/Utils/functions.tsx";
import { MemberType } from "src/Utils/types.ts";

import projectsData from "../Data/projects.json";
import consulting from "../Data/consulting.json";

// Flatten if needed
const flatProjects = Array.isArray(projectsData.projects)
  ? projectsData.projects
  : Object.values(projectsData.projects).flat();

const OurWork = () => {
  const sections = ["projects", "clients"];
  const [currSection, setCurrSection] = useState<(typeof sections)[number]>("projects");

  // Dynamic pagination depending on section
  const getSectionItems = () => {
    if (currSection === "projects") return flatProjects;
    if (currSection === "clients") return consulting.clients;
    if (currSection === "members") return consulting.members;
    return [];
  };

  const items = getSectionItems();

  const { page, setPage, numPages, setNumPages, cardsPerPage, start, end } = usePaginate({
    totalItems: items.length,
    numRows: 3,
  });

  const gridClass =
    "w-full grid grid-cols-[repeat(auto-fit,minmax(clamp(300px,40vw,350px),1fr))] justify-center gap-y-8";

  return (
    <Section title=" " id="our-work">
      <div className={`w-full flex flex-col items-center gap-10 hidden`}>
        <div className={gridClass}>
          {flatProjects.slice(start, end).map((project, index) => (
            <HoverCard key={index} {...project} size="300px" />
          ))}
        </div>
      </div>

      <div className={twMerge(gridClass, "hidden")}>
        {consulting.members.slice(start, end).map((member, index) => (
          <HoverCard
            key={index}
            title={member.name}
            image={member.image}
            description={member.role}
            links={formatMemberLinks(member as MemberType)}
            size="300px"
          />
        ))}
      </div>

      <div className={twMerge(gridClass, "hidden")}>
        {consulting.clients.slice(start, end).map(({ name, image, url }, index) => (
          <HoverCard key={index} title={name} image={image} size="300px" link={url} />
        ))}
      </div>
    </Section>
  );
};

export default OurWork;
