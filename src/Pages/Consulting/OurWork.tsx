import { useState } from "react";
import Section from "../../Components/Section";
import { capitalize, formatMemberLinks } from "../../Utils/functions.tsx";
import HoverCard from "../../Components/HoverCard";
import projectsData from "../../Assets/Data/consulting-projects.json";
import consulting from "../../Assets/Data/consulting.json";
import { MemberType } from "../../Utils/types";
import { twMerge } from "tailwind-merge";
import Paginate from "../../Components/Paginate";
import { usePaginate } from "../../Hooks/usePaginate.ts";

const OurWork = () => {
  const sections = ["projects", "clients"];
  const [currSection, setCurrSection] = useState<(typeof sections)[number]>("projects");

  const projects = projectsData.projects;
  type YearType = keyof typeof projects;
  const years = Object.keys(projects).reverse() as YearType[];
  const [year, setYear] = useState<YearType>(years[0]);

  const { page, setPage, numPages, setNumPages, cardsPerPage, start, end } = usePaginate({
    totalItems: projects[year].length,
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
              setNumPages(
                Math.ceil(
                  (section == "projects"
                    ? projects[year]
                    : consulting[section as keyof typeof consulting]
                  ).length / cardsPerPage
                )
              );
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
        <fieldset className="fieldset w-[clamp(20rem,25vw,25rem)] flex flex-col md:flex-row md:gap-4 items-center">
          <span className="text-[clamp(1rem,1.5vw,1.2rem)] font-semibold">Year: </span>
          <select
            value={year}
            className="select select-primary"
            onChange={(e) => setYear(e.target.value as YearType)}
          >
            {years.map((year, index) => (
              <option key={index}>{year}</option>
            ))}
          </select>
        </fieldset>

        <div className={gridClass}>
          {projects[year].slice(start, end).map((project, index) => (
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
        {consulting.clients.slice(start, end).map(({ name, image }, index) => (
          <HoverCard key={index} title={name} image={image} size="300px" />
        ))}
      </div>

      <Paginate numPages={numPages} page={page} setPage={setPage} />
    </Section>
  );
};

export default OurWork;
