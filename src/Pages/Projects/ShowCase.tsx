import { useState } from "react";
import HoverCard from "../../Components/HoverCard";
import Section from "../../Components/Section";
import projectsData from "../../Assets/Data/projects.json";

const ShowCase = () => {
  const [year, setYear] = useState(2023);
  const [category, setCategory] = useState("All");
  const projects = projectsData.projects;
  const filteredProjects = projects.filter(
    (project) => project.year === year && (category === "All" || project.category === category)
  );

  const years = [
    ...new Set(
      projects
        .map((project) => project.year)
        .sort()
        .reverse()
    ),
  ];

  const categories = [
    ...new Set(
      projects
        .filter((project) => project.year === year)
        .map((project) => project.category)
        .sort()
    ),
  ];

  return (
    <Section>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
        <div className="flex flex-col text-center md:text-left">
          <h2 className="text-2xl font-semibold">PROJECT SHOWCASE</h2>
          <p>Here are some projects from previous years.</p>
        </div>

        <div className="flex gap-4">
          <fieldset className="fieldset w-[clamp(10rem,15vw,15rem)] flex flex-col items-center">
            <span className="text-base font-semibold">Year</span>
            <select
              value={year}
              className="select select-primary"
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {years.map((year, index) => (
                <option key={index}>{year}</option>
              ))}
            </select>
          </fieldset>

          <fieldset className="fieldset w-[clamp(10rem,15vw,15rem)] flex flex-col items-center">
            <span className="text-base font-semibold">Category</span>
            <select
              value={category}
              className="select select-primary"
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All</option>
              {categories.map((category, index) => (
                <option key={index}>{category}</option>
              ))}
            </select>
          </fieldset>
        </div>
      </div>

      <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(clamp(300px,40vw,350px),1fr))] justify-center gap-y-8">
        {filteredProjects.slice(0, 6).map(({ name, image }, index) => (
          <HoverCard key={index} title={name} size="clamp(300px, 40vw, 350px)" image={image} />
        ))}
      </div>
    </Section>
  );
};

export default ShowCase;
