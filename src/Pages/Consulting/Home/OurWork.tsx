import { useState } from "react";
import Section from "../../../Components/Section.tsx";
import projectsData from "../../../Assets/Data/consulting-projects.json";
import Paginate from "../../../Components/Paginate.tsx";
import { usePaginate } from "../../../Hooks/usePaginate.ts";


// Flatten if needed
const flatProjects = Array.isArray(projectsData.projects)
  ? projectsData.projects
  : Object.values(projectsData.projects).flat();


const OurWork = () => {
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const categories = ["Machine Learning", "Data Engineering", "Data Analytics", "Web Development"];

  // Get filtered projects
  const getFilteredProjects = () => {
    if (filterCategory) {
      return flatProjects.filter(
        (project: any) => {
          const cats = project.card.categories || [project.card.category];
          return cats.includes(filterCategory);
        }
      );
    }
    return flatProjects;
  };

  const filteredProjects = getFilteredProjects();

  const { page, setPage, numPages, setNumPages, cardsPerPage, start, end } = usePaginate({
    totalItems: filteredProjects.length,
    numRows: 3,
  });

  return (
    <Section title="Our Work" id="our-work">
      {/* Filter buttons - much bigger */}
      <div className="w-full flex flex-wrap justify-center gap-5 mb-16">
        <button
          onClick={() => {
            setFilterCategory(null);
            setPage(1);
          }}
          className={`px-10 py-4 rounded-full text-lg font-bold transition-all ${
            filterCategory === null
              ? "bg-orange-400 text-[#101018]"
              : "bg-[#181824] text-gray-300 hover:bg-[#26263a]"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setFilterCategory(category);
              setPage(1);
            }}
            className={`px-10 py-4 rounded-full text-lg font-bold transition-all ${
              filterCategory === category
                ? "bg-orange-400 text-[#101018]"
                : "bg-[#181824] text-gray-300 hover:bg-[#26263a]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Cards grid - square cards */}
      <div className="w-full grid gap-8 md:grid-cols-3 lg:grid-cols-3">
        {filteredProjects
          .slice(start, end)
          .map((project: any, idx: number) => {
            // Get categories from project (can be array or single value)
            const displayCategories = project.card.categories || [project.card.category || "Data Analytics"];

            return (
              <div
                key={idx}
                className="
                  relative flex flex-col items-center justify-between
                  bg-[#101018]
                  border border-[#26263a]
                  rounded-2xl
                  shadow-[0_18px_40px_rgba(0,0,0,0.55)]
                  overflow-hidden
                  transition-all duration-150
                  hover:-translate-y-1
                  hover:shadow-[0_24px_50px_rgba(0,0,0,0.65)]
                  aspect-square
                "
              >
                {/* Logo fills the card */}
                <div className="w-full flex-1 flex items-center justify-center bg-[#0a0a0f] overflow-hidden">
                  {project.card.clients.map((client: any, cIdx: number) => (
                    <img
                      key={cIdx}
                      src={client.image}
                      alt={client.name}
                      className="h-full w-full object-cover"
                    />
                  ))}
                </div>

                {/* Title and tag at bottom */}
                <div className="w-full p-6 flex flex-col items-center gap-4">
                  <h3 className="text-3xl font-bold text-white text-center leading-tight">
                    {project.card.title}
                  </h3>

                  {/* Tag pills - bigger */}
                  <div className="flex flex-wrap justify-center gap-3">
                    {displayCategories.map((cat: string, catIdx: number) => (
                      <span key={catIdx} className="inline-flex items-center gap-3 rounded-full bg-[#181824] px-8 py-4">
                        <span className="h-4 w-4 rounded-full bg-orange-400" />
                        <span className="text-lg font-semibold text-gray-200">
                          {cat}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Pagination */}
      {numPages > 1 && (
        <div className="w-full flex justify-center mt-10">
          <Paginate numPages={numPages} page={page} setPage={setPage} />
        </div>
      )}
    </Section>
  );
};


export default OurWork;
