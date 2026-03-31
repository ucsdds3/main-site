import { useState } from "react";
import { twMerge } from "src/Utils/cn";

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
    <Section title="Our Work" id="our-work">
      <div className="w-full flex justify-center">
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => {
              setPage(1);
              setCurrSection(section);
              setNumPages(Math.ceil(getSectionItems().length / cardsPerPage));
            }}
            className="flex-1 border-0 border-b-2 rounded-none bg-transparent text-[clamp(1rem,4vw,2rem)] pb-3 focus:border-(--color-primary) data-[active=true]:border-(--color-primary)"
            data-active={currSection === section}
          >
            {capitalize(section)}
          </button>
        ))}
      </div>

      <div
        className={`w-full flex flex-col items-center gap-10 ${
          currSection == "projects" ? "" : "hidden"
        }`}
      >
        <div className={gridClass}>
          {flatProjects.slice(start, end).map((project, index) => (
            <HoverCard key={index} {...project} size="300px" />
          ))}
        </div>
      </div>

      <div className={twMerge(gridClass, currSection == "members" ? "" : "hidden")}>
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

      <div className={twMerge(gridClass, currSection == "clients" ? "" : "hidden")}>
        {consulting.clients.slice(start, end).map(({ name, image, url }, index) => (
          <HoverCard key={index} title={name} image={image} size="300px" link={url} />
        ))}
      </div>

      <Paginate numPages={numPages} page={page} setPage={setPage} />
    </Section>
  );
};

export default OurWork;
