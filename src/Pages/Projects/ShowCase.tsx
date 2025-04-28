import { useState } from "react";
import HoverCard from "../../Components/HoverCard";
import Section from "../../Components/Section";
import projectsData from "../../Assets/Data/projects.json";
import { newArray } from "../../Utils/functions";

const ShowCase = () => {
  const projects = projectsData.projects;
  type YearType = keyof typeof projects;
  const years = Object.keys(projects).reverse() as YearType[];
  const [year, setYear] = useState<YearType>(years[0]);

  const cardsPerPage = 3;
  const numPages = projects[year].length / cardsPerPage;
  const [page, setPage] = useState(1);
  const endPage = page * cardsPerPage;
  const startPage = (page - 1) * cardsPerPage;

  return (
    <Section>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
        <div className="flex flex-col text-center md:text-left">
          <h2 className="text-2xl font-semibold">PROJECT SHOWCASE</h2>
          <p>Here are some projects from previous years.</p>
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
        {projects[year].slice(startPage, endPage).map((project, index) => (
          <HoverCard key={index} {...project} size="clamp(300px, 40vw, 350px)" />
        ))}
      </div>

      <div className="join">
        {newArray(numPages).map((_, index) => (
          <button
            key={index}
            className="join-item btn data-[active=true]:btn-active"
            onClick={() => setPage(index + 1)}
            data-active={page == index + 1}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </Section>
  );
};

export default ShowCase;
