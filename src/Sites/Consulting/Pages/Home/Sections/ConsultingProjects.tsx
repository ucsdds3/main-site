// C:\Users\dmath\OneDrive\Desktop\Proper Main Site\main-site\main-site\src\Components\ConsultingProjects.tsx
import { useState } from "react";
import consultingProjects from "../Data/projects.json";
import Section from "src/Shared/Page/Section";
import Paginate from "src/Shared/Components/Paginate";
import { usePaginate } from "src/Hooks/usePaginate";

export default function ConsultingProjects() {
  const [activeFilter, setActiveFilter] = useState("All");
  const projects2024 = consultingProjects.projects["2025"];

  // Get unique categories
  const allCategories = ["All"];
  projects2024.forEach(project => {
    project.card.categories.forEach(cat => {
      if (!allCategories.includes(cat)) {
        allCategories.push(cat);
      }
    });
  });

  // Filter projects based on active filter
  const filteredProjects =
    activeFilter === "All"
      ? projects2024
      : projects2024.filter(project => project.card.categories.includes(activeFilter));

  const { page, setPage, numPages, setNumPages, cardsPerPage, start, end } = usePaginate({
    totalItems: filteredProjects.length,
    numRows: 2,
  });

  return (
    <Section>
      <div className="max-w-7xl mx-auto">
        {/* Header Title */}
        <h2 className="text-5xl font-bold text-center text-white mb-8">OUR WORK</h2>

        {/* Filter buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {allCategories.map(category => (
            <button
              key={category}
              onClick={() => {
                setActiveFilter(category);
                setPage(1);
              }}
              className={`
                px-8 py-3 rounded-full text-m font-medium
                transition-all duration-200
                hover:cursor-pointer
                ${
                  activeFilter === category
                    ? "bg-orange-500 text-white"
                    : "bg-[#1a1a2e] text-gray-300 hover:bg-[#232339]"
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filteredProjects.slice(start, end).map((project, idx) => (
            <div
              key={idx}
              className="
                relative flex flex-col
                bg-[#0a0a12]
                border border-[#1f1f2e]
                rounded-xl
                overflow-hidden
                transition-all duration-200
                hover:-translate-y-1
                hover:shadow-xl
                h-full
              "
            >
              {/* Large top image - Fills the square */}
              <div className="relative h-75 bg-[#0f0f1a] flex items-center justify-center">
                <img
                  src={project.card.image}
                  alt={project.card.title}
                  className="w-full h-full object-cover"
                  style={
                    project.card.imageScale
                      ? {
                          transform: `scale(${project.card.imageScale})`,
                          transformOrigin: "center",
                        }
                      : undefined
                  }
                />
              </div>

              {/* Content section */}
              <div className="p-6 flex flex-col items-center text-center flex-grow">
                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-4 leading-tight">
                  {project.card.title}
                </h3>

                {/* Category tags - Centered */}
                <div className="flex flex-wrap justify-center gap-2 mt-auto">
                  {project.card.categories.map((category, cIdx) => (
                    <span
                      key={cIdx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1a2e] text-m font-medium text-gray-300 border border-gray-800"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Paginate numPages={numPages} page={page} setPage={setPage} />
      </div>
    </Section>
  );
}
