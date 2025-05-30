import { useState } from "react";
import HoverCard from "../../Components/HoverCard";
import Section from "../../Components/Section";
import projectsData from "../../Assets/Data/projects.json";
import Paginate from "../../Components/Paginate";
import { usePaginate } from "../../Hooks/usePaginate";

const ShowCase = () => {
  const projects = projectsData.projects;
  type YearType = keyof typeof projects;
  const years = Object.keys(projects).reverse() as YearType[];
  const [year, setYear] = useState<YearType>(years[0]);

  const { page, setPage, numPages, start, end } = usePaginate({
    totalItems: projects[year].length,
    numRows: 1,
  });
  console.log(numPages);

  return (
    <Section>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
        <div className="flex flex-col text-center md:text-left">
          <h2 className="text-5xl font-semibold">PROJECT SHOWCASE</h2>
          <p className="text-2xl"> Here are some projects from previous years.</p>
        </div>

        <fieldset className="fieldset w-[clamp(10rem,15vw,15rem)] flex flex-col items-center">
          <span className="text-base font-semibold">Year</span>
          <select
            value={year}
            className="select select-primary"
            onChange={(e) => {
              setYear(e.target.value as YearType);
            }}
          >
            {years.map((year, index) => (
              <option key={index}>{year}</option>
            ))}
          </select>
        </fieldset>
      </div>

      <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(clamp(300px,40vw,350px),1fr))] justify-center gap-y-8">
        {projects[year].slice(start, end).map((project, index) => (
          <HoverCard key={index} {...project} size="clamp(300px, 40vw, 350px)" />
        ))}
      </div>

      <Paginate numPages={numPages} page={page} setPage={setPage} />
    </Section>
  );
};

export default ShowCase;
